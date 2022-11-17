

const AWS = require('aws-sdk')
const AWSXRay = require('aws-xray-sdk')

const XAWS = AWSXRay.captureAWS(AWS)

// TODO: Implement the fileStogare logic


const s3 = new XAWS.S3({
    signatureVersion: 'v4'
  })




  const bucket = process.env.ATTACHMENT_S3_BUCKET

export async function getSignedUrl(todoId: string) {
    return await s3.getSignedUrl('putObject', {
        Bucket: bucket,
        Key: todoId,
        Expires: 300
      })
}