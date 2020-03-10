# nestor
Deploy your Node.js  application on AWS using github actions.

# TODO

- [ ] update APIGateway if exists, otherwise a duplicate is created
- [ ] update policy of lambda to allow API Gateway invocation
- [ ] check if update of function works after publishing of the function

Add permission to an api to invoke a function:

```
aws lambda add-permission \
  --statement-id 3f32adb8-2a29-5362-90c1-826c6ead8ccc \
  --action lambda:InvokeFunction \
  --function-name "arn:aws:lambda:us-west-1:464972470401:function:myapp-local-myLambda" \
  --principal apigateway.amazonaws.com \
  --source-arn "arn:aws:execute-api:us-west-1:464972470401:cpjn9vdsr2/*/$default"
```

produces:


```
{
  "StatementId": "3f32adb8-2a29-5362-90c1-826c6ead8ccc",
  "Action": "lambda:InvokeFunction",
  "FunctionName": "arn:aws:lambda:us-west-1:464972470401:function:myapp-local-myLambda",
  "Principal": "apigateway.amazonaws.com",
  "SourceArn": "arn:aws:execute-api:us-west-1:464972470401:cpjn9vdsr2/*/$default"
}
```

based on ([here](https://docs.aws.amazon.com/apigateway/latest/developerguide/api-gateway-control-access-using-iam-policies-to-invoke-api.html)):

```
"Resource": [
        "arn:aws:execute-api:region:account-id:api-id/stage/METHOD_HTTP_VERB/Resource-path"
      ]
```
