# homepage
This site is hosted on bhock.net via AWS route53 & Cloudfront with static files sitting in "homepage" S3 bucket.

To deploy, commit a change and push to master.  If a build doesn't trigger and deploy automatically (wait about 3 minutes and remember to delete browswer cache), go to Amazon codebuild on root account and run a build there: 

https://us-west-2.console.aws.amazon.com/codesuite/codebuild/009241727190/projects/homepage/history?region=us-west-2&builds-meta=eyJmIjp7InRleHQiOiIifSwicyI6e30sIm4iOjIwLCJpIjowfQ
