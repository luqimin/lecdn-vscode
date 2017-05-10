const vscode = require('vscode');
const http = require('http');
const fs = require('fs');
const FormData = require('form-data');

let uploadFile = function (CONFIG, filePath) {
    let form = new FormData();

    form.append('channel', CONFIG.channel);
    form.append('username', CONFIG.username);
    form.append('md5str', CONFIG.md5str);
    form.append('single_upload_submit', CONFIG.single_upload_submit);
    form.append('type', CONFIG.type);
    form.append('compress', CONFIG.compress);
    form.append('single_upload_file', fs.createReadStream(filePath));

    let option = {
        host: CONFIG.host,
        port: CONFIG.port,
        method: 'POST',
        path: CONFIG.path,
        headers: form.getHeaders()
    }

    let req = http.request(option, function (res) {
        res.on('data', function (chunk) {
            let _res = JSON.parse('' + chunk);
            if (_res.state == 1) {
                vscode.window.showInformationMessage(`上传成功: ${_res.file}`);
            } else {
                vscode.window.showErrorMessage(`上传失败: ${_res.file}`);
            }
        });
    });

    form.pipe(req);
};

function activate(context) {
    let CONFIG = vscode.workspace.getConfiguration('lecdn');
    var uploader = vscode.commands.registerCommand('extension.lecdn', function () {
        if (!CONFIG.host) {
            vscode.window.showWarningMessage('请先完成lecdn配置, 具体咨询QiminLu');
            return;
        }
        let _curWindow = vscode.window.activeTextEditor;
        if (_curWindow) {
            let currentFile = _curWindow.document.fileName;
            uploadFile(CONFIG, currentFile);
        } else {
            vscode.window.showInputBox({
                value: vscode.workspace.rootPath + '/',
                prompt: '未获取到文件路径, 请手动输入后按Enter上传'
            }).then(function (text) {
                fs.exists(text, (exists) => {
                    if (exists && text.indexOf('.') != -1) {
                        uploadFile(CONFIG, text);
                    } else {
                        vscode.window.showErrorMessage(`文件不存在, 检查一下路径是否正确吧？ => ${text}`);
                    }
                });
            });
        }

    });
    var editConfig = vscode.commands.registerCommand('extension.lecdnConfig', function () {
        vscode.window.showInformationMessage(`请手动打开vscode设置, 搜索 lecdn, 进行相关配置`);
    });
    context.subscriptions.push(uploader);
    context.subscriptions.push(editConfig);
}
exports.activate = activate;

function deactivate() {}
exports.deactivate = deactivate;