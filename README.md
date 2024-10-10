# DURGA KAWACH

- To start follow the following steps:
open the folders in differnt VScode windows

in frontend dir

``` bash 
    npm intall
    npm run dev
```
run the frontend on a new chrome instance without web security to bypass CORS issue, 
for macos

```bash
   open -na "Google Chrome" --args --disable-web-security --user-data-dir="/tmp/chrome_dev"
```
for windows
```cmd
   "C:\Program Files (x86)\Google\Chrome\Application\chrome.exe" --disable-web-security --user-data-dir="C:\chrome_dev"
``` 

in backend dir

``` bash
    npm install
    node server.js
```

in python_script dir

``` bash
    pip install -r requirements.txt 
```
then run main.py

