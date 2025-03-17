export class FileValidator {
  static isValidFile(
    validMimeTypes: string[],
    fileOrFiles: Express.Multer.File[] | Express.Multer.File,
    throwError = true,
  ): boolean {
    if (!fileOrFiles) {
      return true;
    }

    const invalidFileMessage = `Invalid file type, please ensure file is of ${validMimeTypes.join(
      ', ',
    )}`;

    if (fileOrFiles) {
      if (Array.isArray(fileOrFiles)) {
        const isValid = fileOrFiles.every((file) =>
          FileValidator.isValidFile(validMimeTypes, file, throwError),
        );

        if (!isValid && throwError) {
          throw new Error(invalidFileMessage);
        }

        return isValid;
      } else {
        const isValid = validMimeTypes.includes(fileOrFiles?.mimetype);

        if (!isValid && throwError) {
          throw new Error(invalidFileMessage);
        }

        return isValid;
      }
    }

    return false;
  }
}
