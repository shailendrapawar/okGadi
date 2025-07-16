import path from "path"
import fs from "fs"

const deleteIconfromServer = async (iconName) => {

    try {
        console.log(iconName)
        const filePath = path.join(process.cwd(), "uploads", "icons-uploads", iconName)
        console.log("path", filePath)

        fs.unlink(filePath, (err) => {
            if (err) console.error('Error deleting file:', err);
            else console.log('Icon file deleted');
        });

    } catch (err) {
        console.log(err);
    }

}

export default deleteIconfromServer;