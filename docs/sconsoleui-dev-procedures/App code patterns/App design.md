#### Contents

[[#Introduction]]
[[#Logical structure of a feature application]]
[[#Folder structure of an application]]

### Introduction

This page documents the design patterns employed in a typical feature application.

Check this page for [[Creating a new application]].

An application is an independent single page application.

An application registers itself with the `app-home` application for it to be navigable from the home page. `app-home` is a special application which hosts multiple applications grouped under sections and enables navigation to them.

### Logical structure of a feature application

A framework construct is used to provide a uniform approach to building applications without too much restriction and  impositions. This enables common and reusable application components to be hosted in the `lib-core` library.

An application has a `PageHeader` which displays the section and title of the application and provides navigability back to the `app-home` SPA.

An application is logically divided into multiple `features`. A _feature_ is structurally an angular component which can be enabled in the body (router outlet) of the application page. A feature is free to structure its UI and transitions without any need of framework conformance. All features of an application can be made navigable through the `FeatureMenubar` library component. A feature component is free to use the `PageToolbar` library component to drive feature specific actions in an uniform way.

### Folder structure of an application

![[Pasted image 20250107124905.png]]

### Preparing for adding the first feature

Once the application is [[Creating a new application|created]], it contains some auto-generated files and directories which needs to be cleaned or organised to allow for a _framework aligned_ application development.

A feature can be created by the following command

```
ng generate component \
    ManageBooks \                 <- Replace this with the feature component
    --project-name=app-jee-mdm \  <- Provide the hosting project name
    --skip-tests
```

Post this, the a newly created application with the above feature looks like this. We need to the perform the displayed structural changes to arrive at the right had side structure. Note that these are just file movement and deletion operations. The file contents will be changed next.

![[Pasted image 20250107142118.png]]

> [!NOTE]- Summary of changes
> - Delete `tsconfig.spec.json`
> - Move `styles.css` from root to assets
> - Delete `.gitkeep`
> - Delete `favicon.ico`
> - Create directory `features`
> - Move the newly created feature into the `features` folder
> - Delete the `app` folder

### Changes to the base app files

###### `index.html`

``` html
<!doctype html>  
<html lang="en">  
<head>  
    <meta charset="utf-8">  
    <title>[Application Title]</title>  
    <base href="/">  
    <meta name="viewport" content="width=device-width, initial-scale=1">  
    <link rel="icon" type="image/x-icon" href="/core-assets/favicon.ico">  
</head>  
<body>  
<app-root></app-root>  
</body>  
</html>
```

###### `main.ts`

Copy `main.ts` from an existing application to the new application's root overwriting the existing `main.ts`. Make the following changes.

``` js
// Import the new feature component
import { ManageBooksComponent } from "./features/manage-books/manage-books.component";  

// Add the new feature component to the routes array.
const routes: Routes = [  
    {  
        path: '',  
        title: 'Manage Books',  
        component: ManageBooksComponent  
    },  
    {  
        path: 'manage-books',  
        title: 'Manage Books',  
        component: ManageBooksComponent  
    },  
] ;
```

```js
class AppComponent {  
	// Update the title string
    title: string = 'JEE Preparation > Master Data Management' ;  
    
	// Add the feature to the meta data of the features menu. This
	// will enable the features menubar to display the feature
	// icon and provide navigation capabilities.
    menubarMeta : FeatureMenuItemMeta[] = [  
        { iconName:'journals',  routePath:'/manage-books', selected:true },  
    ] ;  
}
```
