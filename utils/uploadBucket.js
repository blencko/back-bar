process.env.NODE_ENV = process.env.NODE_ENV || 'development';
var serviceAccount = require('../config/bancoarbi-72904-firebase-adminsdk-c608b-1fbdd9e6f6.json');
var getImage = require('./get.image');

/**
 * Firebase Connection
 */
const { Storage } = require('@google-cloud/storage');

const storage = new Storage({
    projectId: process.env.FIREBASE_ID,
    credentials: serviceAccount
});


const bucket = storage.bucket(process.env.FIREBASE_HOST);



exports.upload = (data) => {
    return new Promise((resolve, reject) => {
        if (!data.file) {
            reject('No image file');
        }
        let newFileName = `storage/${data.id}_${Date.now()}_${data.file.originalname}`;

        let fileUpload = bucket.file(newFileName);

        const blobStream = fileUpload.createWriteStream({
            metadata: {
                contentType: data.file.mimetype
            }
        });

        blobStream.on('error', (error) => {
            console.log(error);
        });

        blobStream.on('finish', () => {
            // The public URL can be used to directly access the file via HTTP.
            getImage.getFile(newFileName)
                .then((image) => {
                    resolve(image);
                })
        });

        blobStream.end(data.file.buffer);
    });
}

exports.delete = (file) => {
    return bucket.file(file).delete();
}