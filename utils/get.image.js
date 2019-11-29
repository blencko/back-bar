const { Storage } = require("@google-cloud/storage")

// Your Google Cloud Platform project ID                                        
const projectId = 'bancoarbi-72904';

// Creates a client                                                             
const storage = new Storage({
    projectId: projectId,
    keyFilename: "config/bancoarbi-72904-firebase-adminsdk-c608b-1fbdd9e6f6.json"
});

// The name for the new bucket                                                  
const bucketName = 'bancoarbi-72904.appspot.com';

bucket = storage.bucket(bucketName);
file = bucket.file("image.jpg");

exports.getFile = async (pathFile) => {
    var image;
    var CONFIG = {
        action: 'read',
        expires: '03-01-2500',
    };

    file = bucket.file(pathFile);
    return await file.getSignedUrl(CONFIG);
}

exports.authImage = async (array, type) => {
    newValues = [];

    for (let i = 0; i < array.length; i++) {
        console.log(array[i]);
        // await this.getFile(array[i]._id)
        //     .then(image => {
        //         array[i][type] = image[0];
        //         newValues.push(array[i]);
        //     })
    }

    return newValues;
}