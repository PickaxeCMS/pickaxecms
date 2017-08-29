<!-- Logo -->
<p align="center">
  <a href="">
    <img height="128" width="128" src="https://github.com/PickaxeCMS/pickaxecms/blob/master/logo.png">
  </a>
</p>

<!-- Name -->
<h1 align="center">
  <a>Pickaxe CMS</a>
</h1>

Pickaxe CMS is a free open source content management server for Amazon Web Services.

## Dependencies    

### [Node.js](https://nodejs.org/en/) and [NPM](https://www.npmjs.com/)

**Node.js** is a lightweight and efficient JavaScript runtime that uses an event-driven, non-blocking I/O model.

**NPM** is a package manager for JavaScript.

+ [Install Node.js and update npm](https://docs.npmjs.com/getting-started/installing-node)


### [jq](https://stedolan.github.io/jq/)

**jq** is a lightweight and flexible command-line JSON processor.

+ [Install jq](https://stedolan.github.io/jq/download/)


### [Serverless Framework](https://serverless.com/framework/)

**Serverless Framework** is a CLI for building serverless architectures on AWS.

+ [Install serverless CLI](https://serverless.com/framework/docs/getting-started/)


### [AWS CLI](http://docs.aws.amazon.com/cli/latest/userguide/cli-chap-welcome.html)

The AWS CLI provides commands for interacting with Amazon Web Services.

+ [Install AWS CLI](http://docs.aws.amazon.com/cli/latest/userguide/installing.html)

Make sure aws-cli is configured using correct credentials.    
If not, run:      
`
$  aws configure
`     
Using Access Key and Secret Access Keys credentials obtained from AWS Console.   
(For more help on this, check out the <a href="http://docs.aws.amazon.com/cli/latest/userguide/installing.html">AWS CLI Installation Guide</a> and <a href="http://docs.aws.amazon.com/cli/latest/userguide/cli-chap-getting-started.html#cli-quick-configuration"> AWS CLI Configuration Guide</a>)   


## Installation & Usage

       
         
#### If this is your first time running Pickaxe, start with this:            
        
`$  ./initialBuild.sh <NAME_OF_YOUR_APP> <REGION_OF_DEPLOYMENT>`
        
         
Example:      
`$    ./initialBuild.sh SuperCoolApp us-east-1`    
       
        
NOTE: If there is an output of Permission Denied, run:     
`$  chmod +x ./initialBuild.sh`     
      
       
#### To just run the development server:      
       
`$  ./development.sh <NAME_OF_YOUR_APP> <REGION_OF_DEPLOYMENT>`     
NOTE: This will only work if you have run firstTime.sh to build out the backend.
      
    
#### To run a production build:      
       
`$  ./production.sh <NAME_OF_YOUR_APP> <REGION_OF_DEPLOYMENT>`     
NOTE: This will only work if you have run firstTime.sh to build out the backend.
      
