# windows31
Windows 3.1, running in an [Electron](https://electronjs.org/) app.
# Languages
* English (Work in progress)
* Russian
# Downloads
| Type / OS | Windows, English | Windows, Russian |
|---------------------|-----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------|-----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------|
| Zip | 📦[Standalone, Zip, En, 32-bit]()  | 📦[Standalone,Rar, Rus, 32-bit](https://github.com/Pixelsuft/windows31/releases/download/v1.1-alpha/windows31ru-win32-ia32.rar)  |
| Setup | 💽[Setup, Exe, En, 32-bit]()  | 💽[Setup, Exe, Rus, 32-bit](https://github.com/Pixelsuft/windows31/releases/download/v1.1-alpha/windows31ru-win32-ia32.exe)  |
# Installing
Download [source](https://github.com/Pixelsuft/windows31/edit/main/README.md) and extract.<br /> Extract windows31.img from [release](https://github.com/Pixelsuft/windows31/edit/main/README.md) archive in src folder to src folder.<br /> Install python.<br /> Open shell and type: <br />
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
# Screenshots
![Screenshot](https://github.com/Pixelsuft/windows31/blob/main/src/boot.png?raw=true)
