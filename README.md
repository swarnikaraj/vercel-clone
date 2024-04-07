Vercle-clone allow user to deploy any react application with its public github url via just one click.
Teck stack used : Nodejs, Docker, React app, Aws ECS, Aws ECR, AWs S3, AWs Lamda , redis.
Step to setup in your local



![Example Image](diagram-export-4-7-2024-12_37_53-PM.png)


How to push created builder server to aws
docker tag <imagename>:latest <account-id>.dkr.ecr.us-east-1.amazonaws.com/<imagename>:latest

aws ecr get-login-password --region <region> | docker login --username AWS --password-stdin <account-id>.dkr.ecr.<region>.amazonaws.com

docker push <account-id>.dkr.ecr.us-east-1.amazonaws.com/<imagename>:latest
