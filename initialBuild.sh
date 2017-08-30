# Setting the script to error out and stop if any single statement exits non-0.
set -e;

# Then we can do something like:
#     $ ./example.sh TestStack us-west-2;

STACK=$1;
STACK_NO_WHITESPACE="$(echo -e "${STACK}" | tr -d '[:space:]')"
STACKNAME="$STACK_NO_WHITESPACE-serverless-prod";
export REACT_APP_AWS_REGION=$2 || 'us-east-1';

# This is a standard Bash trick to get the directory the script is running in.
DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" && pwd )";

# GIT CLONE

# Install All Dependencies
npm install

# Go into serverless directory
cd ./serverless

# Deploy the app using Serverless
APP_NAME="$STACK_NO_WHITESPACE" serverless deploy --verbose SLS_DEBUG=*

# Retrieve all outputs from the stack and set them as environment variables.
# NOTE: For use in the React App, all env variables must be preceded by REACT_APP_
stack_info=$(aws cloudformation describe-stacks --region $REACT_APP_AWS_REGION --stack-name $STACKNAME --output json)
if [[ "$stack_info" =~ "OutputKey" ]]; then
  read -r -a output_keys <<< $(echo "$stack_info" | jq ".Stacks[].Outputs[].OutputKey")
  read -r -a output_vals <<< $(echo "$stack_info" | jq ".Stacks[].Outputs[].OutputValue")
  for ((i=0;i<${#output_keys[@]};++i)); do
    key=$(echo "${output_keys[i]}" | sed -e 's/^"//'  -e 's/"$//')
    val=$(echo "${output_vals[i]}" | sed -e 's/^"//'  -e 's/"$//')
    echo "export $key=$val"
    export "REACT_APP_$key"="$val"
  done
fi

# Upload Site Logo (Default is Pickaxe Logo) Allow Read access to ALl
aws s3 cp ../logo.png s3://$REACT_APP_UploadsBucket --grants read=uri=http://acs.amazonaws.com/groups/global/AllUsers

LOGO_S3_URL='https://s3.amazonaws.com/'$REACT_APP_UploadsBucket'/logo.png'
echo 'LOGO_S3_URL' $LOGO_S3_URL
# Initial Build Out of Site Plan
jq -n --arg STACK "$STACK" --arg LOGO_S3_URL "$LOGO_S3_URL"  '{
  "pageId": {"S": "site_plan"},
  "id": {"S": "site_plan"},
  "category": {"S": "page"},
  "navItems": {"M": {}},
  "appSettings": {"M": {
    "name": {"S": $STACK},
    "theme": {"S": "dark"},
    "logo": {"S": $LOGO_S3_URL }
  }},
  "divisions": {"L": [
      {"S": "3658fdaf-750b-57ae-d5c2-d4568de20234"}
    ]}
}' > ../json/site_plan.json

# Add Initial Structure for the site_plan
aws dynamodb put-item --table-name $REACT_APP_AppName --item file://../json/site_plan.json
aws dynamodb put-item --table-name $REACT_APP_AppName --item file://../json/initial_division.json


# Update cors on bucket to be able to upload/view from the app
aws s3api put-bucket-cors \
  --bucket $REACT_APP_UploadsBucket \
  --cors-configuration file://../json/bucketCors.json

# Update acl on bucket to be able to upload/view from the app
aws s3api put-bucket-acl \
  --bucket $REACT_APP_UploadsBucket \
  --acl 'public-read'

# Create first Admin User
aws cognito-idp sign-up \
  --region $REACT_APP_AWS_REGION \
  --client-id $REACT_APP_AppClientId\
  --username admin@example.com \
  --password Passw0rd! \
  --user-attributes Name=email,Value=admin@example.com

# Confirm Admin user
aws cognito-idp admin-confirm-sign-up \
--region $REACT_APP_AWS_REGION \
--user-pool-id $REACT_APP_UserPoolId \
--username admin@example.com

export REACT_APP_NAME=$1

# Change directory to react app
cd ../src
# and confirm correct directory
pwd

# Run the development app
npm start
