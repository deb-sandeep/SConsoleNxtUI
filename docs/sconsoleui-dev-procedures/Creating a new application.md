# Creating a new application (module)

- [[#Generation of base app folder and files]]
- [[#Post app generation changes]]
	- [[#angular.json (app section)]]
	- [[#`configurations > development` node]]
- [[#Run/Debug configuration]]
- [[#Make entry in app-home module]]
- [[#Make entry in build scripts]]
- [[#Do a fresh build]]
- [[#Validate through SConsole SpringBoot app]]

## <font color='yellow'>Generation of base app folder and files</font>

```
# Command is run in the SConsoleNxtUI home directory

ng generate app \
	app-jee-mdm \
	--skip-tests \
	--style css \
	--routing true \
	--ssr false
```

Generates a new angular application (_module_) and updates the `angular.json` file with default meta data for the new application.

![[Pasted image 20250104145804.png|300]]

## <font color='yellow'>Post app generation changes - angular.json </font>

All these changes are relative to the `projects > app-jee-mdm` json node. Replace `app-jee-mdm` with the name of the application that has been created using the `ng generate app` command above.

### `build > options` node

* Add `"baseHref": "/apps/jee/mdm/",`
* Change `outputPath` to:
```
  "outputPath": {  
	  "base" : "dist/webroot/apps/jee/mdm",  
	  "browser": ""  
  },
```
- Remove `favicon.ico` from `assets` section
- Add the following to the `styles` section before the generated line.
```
"node_modules/bootstrap/dist/css/bootstrap.min.css",  
"node_modules/bootstrap-icons/font/bootstrap-icons.min.css",  
"projects/lib-core/assets/bootstrap-overrides.css",  
"projects/lib-core/assets/styles.css",
```

### `configurations > development` node

Add the following.

```
"assets": [  
  {  
    "glob": "**/*",  
    "input": "./projects/lib-core/assets",  
    "output": "/core-assets/"  
  }  
]
```

- Remove the `extract-i18n` and `test` sections

## <font color='yellow'>Run/Debug configuration</font>

Add a new serve configuration for the newly created application.

![[Pasted image 20250104155750.png]]

Running this configuration brings up the newly created app in the browser at the following location. http://localhost:4200/apps/jee/mdm/

## <font color='yellow'>Make entry in app-home module</font>

Add a module entry to the `SectionMeta` array, adding a section if required. Note that `app-home` is a separate application and should be launched via `Serve app-home` run configuration. 

![[Pasted image 20250105121011.png|300]]

## <font color='yellow'>Make entry in build scripts</font>

Make the new application entry in the build scripts `sconsole-build-webapp` and `sconsole-deploy-webapp` in the `~/projects/utilities/ShellScripts/sconsole` folder.

![[Pasted image 20250105124016.png|200]]

## <font color='yellow'>Do a fresh build</font>

Run `sconsole-build-webapp` to do a fresh local build. This will build all the modules and store the output in `~/projects/sconsole/SConsoleNxtUI/dist` folder.

## <font color='yellow'>Validate through SConsole SpringBoot app</font>

Start the `SConsoleNxt` SpringBoot application and load `localhost:8080`. The new application should be visible in the landing page and clicking on it should navigate it to the skeleton generated Angular page.

This concludes the procedure to create a new module (application).


