const fs = require('fs');

const deleteFile = (filePath)=>{
    fs.unlink(filePath,(err)=>{
        if(err){
           console.log("Problem in file.js : 6")
        }
    })
}

exports.deleteFile = deleteFile;