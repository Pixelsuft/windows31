# windows31
Windows 3.1, running in an [Electron](https://electronjs.org/) app.
# Languages
* English
* Russian
# Downloads
| Type / OS | Windows, English | Windows, Russian |
|---------------------|-----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------|-----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------|
| Zip | 📦[Standalone, Rar, En, 32-bit](https://github.com/Pixelsuft/windows31/releases/download/v1.1-alpha/windows31en-win32-ia32.rar)  | 📦[Standalone,Rar, Rus, 32-bit](https://github.com/Pixelsuft/windows31/releases/download/v1.1-alpha/windows31ru-win32-ia32.rar)  |
| Setup | 💽[Setup, Exe, En, 32-bit](https://github.com/Pixelsuft/windows31/releases/download/v1.1-alpha/windows31en-win32-ia32.exe)  | 💽[Setup, Exe, Rus, 32-bit](https://github.com/Pixelsuft/windows31/releases/download/v1.1-alpha/windows31ru-win32-ia32.exe)  |
# Installing
Download [source](https://github.com/Pixelsuft/windows31/archive/v1.1-alpha.zip) and extract.<br /> Extract windows31.img from [release](https://github.com/Pixelsuft/windows31/releases/tag/v1.1-alpha) archive in src folder to src folder.<br /> Install python.<br /> Open shell and type: <br />
```
npm install
pip install flask
pip install pyinstaller
npm start
```
# Building server
```
move server/server.py server.py
pyinstaller server.py -F -i src/icon.ico --add-data "src;src"
move dist/server.exe server.exe
```
<br />
If don't works, move server.py to main folder from resources/app and edit it for this folder
# Screenshots
![Screenshot](https://github.com/Pixelsuft/windows31/blob/main/src/boot.png?raw=true)
