const AWS = require('aws-sdk');
const config = require('../config/awsconfig');

AWS.config.update({
  region: config.region,
  accessKeyId: config.accessKeyId,
  secretAccessKey: config.secretAccessKey,
});

const s3 = new AWS.S3();

const uploadFile = (fileName, fileContent) => {
  const params = {
    Bucket: config.bucketName,
    Key: fileName,
    Body: fileContent,
  };

  return s3.upload(params).promise();
};

// Delete every object under a key prefix (e.g. "student_documents/123/").
// Returns the number of objects deleted.
const deleteFolder = async (prefix) => {
  let deleted = 0;
  let ContinuationToken;
  do {
    const list = await s3
      .listObjectsV2({ Bucket: config.bucketName, Prefix: prefix, ContinuationToken })
      .promise();
    const objects = (list.Contents || []).map(({ Key }) => ({ Key }));
    if (objects.length) {
      await s3
        .deleteObjects({ Bucket: config.bucketName, Delete: { Objects: objects, Quiet: true } })
        .promise();
      deleted += objects.length;
    }
    ContinuationToken = list.IsTruncated ? list.NextContinuationToken : undefined;
  } while (ContinuationToken);
  return deleted;
};

module.exports = {
  uploadFile,
  deleteFolder,
};
