# Setting the script to error out and stop if any single statement exits non-0.
set -e;

# Then we can do something like:
#     $ ./example.sh TestStack us-west-2;

STACK=$1;
STACK_NO_WHITESPACE="$(echo -e "${STACK}" | tr -d '[:space:]')"
STACKNAME="$STACK_NO_WHITESPACE-serverless-prod";
export REACT_APP_AWS_REGION=$2;
#
# # This is a standard Bash trick to get the directory the script is running in.
DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" && pwd )";

# Retrieve all outputs from the stack and set them as environment variables
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


item=$(aws dynamodb get-item --table-name $STACK_NO_WHITESPACE --key file://./json/get_site_plan.json --output json)

echo $item > ./json/site_plan_dynamo.json

siteName=($(jq -r '.Item.siteName.S' ./json/site_plan_dynamo.json))
siteLogo=($(jq -r '.Item.siteLogo.S' ./json/site_plan_dynamo.json))
siteFont=($(jq -r '.Item.siteFont.S' ./json/site_plan_dynamo.json))

# Export for usage in app
export REACT_APP_NAME=${siteName[@]}
export REACT_APP_LOGO=$siteLogo
export REACT_APP_FONT=$siteFont || 'default'

# Change directory to react app
cd ./src
# and confirm correct directory
pwd

# Run the development app
npm start
