# Setting the script to error out and stop if any single statement exits non-0.
# set -e;

# Then we can do something like:
#     $ ./example.sh TestStack us-west-2;

STACK=$1;
STACKNAME="$1-serverless-prod";
export REACT_APP_AWS_REGION=$2;
#
# # This is a standard Bash trick to get the directory the script is running in.
DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" && pwd )";
#
# Deploy the app using Serverless
APP_NAME="$STACK" serverless deploy --verbose SLS_DEBUG=*

# Retrieve all outputs from the stack and set them as environment variables
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

# Add Initial Structure for the site_plan
aws dynamodb put-item --table-name $REACT_APP_AppName --item file://site_plan.json
aws dynamodb put-item --table-name $REACT_APP_AppName --item file://initial_division.json

aws s3api put-bucket-cors \
  --bucket $REACT_APP_UploadsBucket \
  --cors-configuration file://bucketCors.json

user=$(aws cognito-idp admin-get-user \
  --username admin@example.com \
  --user-pool-id $REACT_APP_UserPoolId)



echo $user

if [[ $(aws cognito-idp admin-get-user \
  --username admin@example.com \
  --user-pool-id $REACT_APP_UserPoolId) ]]; then
  aws cognito-idp sign-up \
    --region $REACT_APP_AWS_REGION \
    --client-id $REACT_APP_AppClientId\
    --username admin@example.com \
    --password Passw0rd! \
    --user-attributes Name=email,Value=admin@example.com
  fi
if [[ -z "$user" ]]; then
    aws cognito-idp admin-confirm-sign-up \
    --region $REACT_APP_AWS_REGION \
    --user-pool-id $REACT_APP_UserPoolId \
    --username admin@example.com
  fi
# Change directory to react app
cd ../src
# and confirm correct directory
pwd

# Run the development app
npm start
