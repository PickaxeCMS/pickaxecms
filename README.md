<!-- Logo -->
<p align="center">
  <a href="">
    <img height="128" width="128" src="https://github.com/PickaxeCMS/pickaxecms/blob/master/pickaxe.png">
  </a>
</p>

<!-- Name -->
<h1 align="center">
  <a>Pickaxe CMS</a>
</h1>

Hey, we're in development.

## Dependencies    

### NPM     
(NPM be downloaded <a href="https://docs.npmjs.com/getting-started/installing-node">here</a>)

### jq         
(jq be downloaded <a href="https://stedolan.github.io/jq/download/">here</a>)     
        
### Serverless Framework    
`     
$  npm install -g serverless`     
  
### AWS Cli      
Make sure aws-cli is configured using correct credentials.    
If not, run:      
`
$  aws configure
`     
Using Access Key and Secret Access Keys credentials obtained from AWS Console.   
(For more help on this, check out the <a href="http://docs.aws.amazon.com/cli/latest/userguide/installing.html">AWS CLI Installation Guide</a> and <a href="http://docs.aws.amazon.com/cli/latest/userguide/cli-chap-getting-started.html#cli-quick-configuration"> AWS CLI Configuration Guide</a>)   


## Installation & Usage

       
         
#### If this is your first time running Pickaxe, run this:            
        
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
      
