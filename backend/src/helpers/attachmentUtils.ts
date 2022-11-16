import * as AWS from 'aws-sdk'
import * as AWSXRay from 'aws-xray-sdk'

const XAWS = AWSXRay.captureAWS(AWS)

// TODO: Implement the fileStogare logic


const s3 = new XAWS.S3({
    signatureVersion: 'v4'
  })




const todosTable = process.env.TODOS_TABLE

export async function getSignedUrl(todoId: string) {
    return await s3.getSignedUrl('putObject', {
        Bucket: todosTable,
        Key: todoId,
        Expires: 300
      })
}