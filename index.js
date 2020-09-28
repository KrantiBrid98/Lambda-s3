const aws = require('aws-sdk');
const s3 = new aws.S3();


function copyFile(bucketName, filePath) {
    const fileName = filePath.split('/')[1]
    const fileExtensionFormat = fileName.split('.')[1]

    var imageFormats = ['jpg', 'png','jpeg','gif', 'bmp']
    var destinationFolder = imageFormats.includes(fileExtensionFormat) ? 'images' : 'others'; 

    const s3Params = {
        Bucket: bucketName,
        CopySource: `${bucketName}/${filePath}`,
        Key: `${destinationFolder}/${fileName}`
    };
    return s3.copyObject(s3Params).promise();
}

function deleteFile(bucketName, filePath) {
    return s3.deleteObject({ Bucket: bucketName, Key: `${filePath}` }).promise();
}

exports.handler = async (event, context, callback) => {
    const bucket = event.Records[0].s3.bucket.name;
    const filePath = decodeURIComponent(event.Records[0].s3.object.key.replace(/\+/g, ' '));  // eg: filepath = upload/arrow.png
    try {
        await copyFile(bucket, filePath).then(r => deleteFile(bucket, filePath));
        console.log(`file copied from ${filePath} to appropriate destination folder`)
    }
    catch (err) {
        console.log(`Failed with the following exception : ${err}`)
    }
};
