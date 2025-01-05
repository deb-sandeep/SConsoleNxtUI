## Create a new workspace

```
ng new \
	--no-create-application 
	--directory SConsoleUI 
	--skip-tests 
	--skip-git sconsole-ui
```

* This creates a new folder called `SConsoleUI`
* Delete the `.vscode` folder immediately.

## Create the asset library

```
ng generate lib lib-core
```

* On generation:
	* Delete the following files:
		* tsconfig.spec.json
		* README.md
		* lib/lib-core.component.spec.ts
		* lib/lib-core.service.spec.ts

## Create a new component

```
ng generate component NewTestSetup \
	--project=app-memgym-arithmetic \
	--skip-tests
```
