import 'source-map-support/register'

import { APIGatewayProxyEvent, APIGatewayProxyResult } from 'aws-lambda'
import * as middy from 'middy'
import { cors, httpErrorHandler } from 'middy/middlewares'
import { getSignedUrl } from '../../helpers/attachmentUtils'
import { createAttachmentPresignedUrl, getTodoById } from '../../businessLogic/todos'
// import { getUserId } from '../utils'


export const handler = middy(
  async (event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> => {
    const todoId = event.pathParameters.todoId
    // TODO: Return a presigned URL to upload a file for a TODO item with the provided id

    const bucketName = process.env.ATTACHMENT_S3_BUCKET
    const todoItem = await getTodoById(todoId)

    todoItem.attachmentUrl = `http://${bucketName}.s3.amazonaws.com/${todoId}`

    await createAttachmentPresignedUrl(todoItem)

    const url = await getSignedUrl(todoId)

    return {
    statusCode: 201,
    headers: {
      'Access-Control-Allow-Origin': '*'
    },
    body: JSON.stringify({
      uploadUrl: url
    })
  }
  }
)
 
handler
  .use(httpErrorHandler())
  .use(
    cors({
      credentials: true
    })
  )
