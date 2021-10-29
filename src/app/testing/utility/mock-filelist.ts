export interface MockFile {
  name: string;
  body: string;
}

export const createFileFromMockFile = (file: MockFile): File => {
  const blob = new Blob([file.body], { type: 'text/plain' });
  blob['lastModifiedDate'] = new Date();
  blob['name'] = file.name;
  return blob as File;
};

export const createMockFileList = (files: MockFile[]): FileList => {
  const fileList: FileList = {
    length: files.length,
    item: (index: number): File => fileList[index]
  };
  files.forEach((file, index) => (fileList[index] = createFileFromMockFile(file)));

  return fileList;
};
