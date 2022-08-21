function readFile(file: File) {
  return new Promise(((resolve, reject) => {
    const { name } = file;
    const reader = new FileReader();
    reader.onload = function onload(e) {
      resolve({
        name,
        text: e.target.result,
      });
    };
    reader.onerror = function onerror() {
      reject();
    };
    reader.readAsText(file);
  }));
}

// 读取Input的file文件内容
// eslint-disable-next-line import/prefer-default-export
export function readFiles(fileList: FileList) {
  const tasks = [];
  for (let i = 0; i < fileList.length; i++) {
    tasks.push(readFile(fileList[i]));
  }
  return Promise.all(tasks);
}
