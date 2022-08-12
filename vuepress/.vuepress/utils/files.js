// 读取Input的file文件内容
export function readFiles(fileList) {
  const tasks = [];
  for (let i = 0; i< fileList.length;i++){
    tasks.push(readFile(fileList[i]))
  }
  return Promise.all(tasks);
}

function readFile(file){
  return new Promise(((resolve, reject) => {
    const name = file.name;
    const reader = new FileReader();
    reader.onload = function (e) {
      resolve({
        name,
        text: e.target.result
      });
    }
    reader.onerror = function (){
      reject();
    }
    reader.readAsText(file)
  }))
}
