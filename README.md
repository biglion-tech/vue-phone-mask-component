# Vue-phone-mask-component(RU/EN)

Vue.js multi phone mask component. 
Just start typing the number and the phone mask will apply automatically.

Russian and English support(see Properties section).

![Preview](https://s2.gifyu.com/images/readme2d75a66a4103c3d6.gif)

## Install

```
npm i vue-multi-mask-component

```

## Usage

```javascript
// import the component
import PhoneMask from 'vue-multi-mask-component'

// register it in your app
new Vue({
  el: '#app',
  components: {PhoneMask}
})

// add component to the template with v-model="value" to sync the value with your data
<template>
  <PhoneMask v-model="value"></PhoneMask>
</template>

```

## Properties and handlers

| Property/handler| Required | Type                    | Default | Description                                |
|-----------------|----------|-------------------------|---------|--------------------------------------------|
| @change         | false    | Method                  |   --    | Set handler for changes                    |
| lang            | false    | String                  |   RU    | Set language RU/EN.                        |
| showRegion      | false    | Boolean                 |   true  | Show region name                           |

Example:
```javascript
// set component language to english
<PhoneMask @input="getValue" lang="EN"></PhoneMask>
```
## Styling

Component class name is 'vue-multi-mask-component'
```javascript
// template structure
<div class="vue-multi-mask-component">
    <input></input>  // phone input
    <p></p>          // region data
</div>
```

## Dependencies

[Inputmask](https://github.com/RobinHerbots/Inputmask)

## Based on

Based on jQuery [inputmask-multi](https://github.com/andr-04/inputmask-multi) plugin

## License

This project is licensed under [MIT License](http://en.wikipedia.org/wiki/MIT_License)