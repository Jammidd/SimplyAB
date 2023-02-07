# SimplyAB
SimplyAB is a simple no-frills JS based experimentation framework

### Setup
To set up SimplyAB, you need to provide either a JSON config or a URL to grab the JSON config from.

### Experiment Configuration
All experiments must be created via a JSON object with the following format:

```
[{
  "name": string representing the name of the experiment (no spaces),
  "status": <string> active | paused | stopped,
  "project" <optional>: <string representing the project (for multiservice apps)>
  "startDate" <optional>: Date and time to start the experiment,
  "endDate" <optional>: Date and time to end the experiment,
  "variants": [{
    "name": "control",
    "weight": 50,
    "status": <string> active | paused | stopped
  }, {
    "name": "variant_1",
    "weight": 25,
    "status": <string> active | paused | stopped
  }, {
    "name": "variant_2",
    "weight": 25,
    "status": <string> active | paused | stopped
  }]
}]
```

All weights must add up to 100, if they don't you will receive a console error and the experiment will exit unchanged.



### Creating and adding an experiment


### Pausing an experiment

### Stopping an experiment

### Overriding assigned experiment
To temporarily override the assigned variant for testing or debugging purposes, you can manually select the experiment via URL parameters:
  - experiment=<experiment_name>
  - variant=<variant_name>

If you set experiment without a variant it will assign the visitor to a random variant under the provided experiment.

If you set the variant without the experiment no action will take place (the override will be ignored).


### Lifecycle hooks

 - onAssign = When a user is assigned to an experiment and variant, this callback will fire with an object 
 ```
 {
  "userId": <randomly generated user ID>
  "experiment": name of the experiment assigned
  "variant": name of the variant assigned
 }
 ```
 
 - onExperimentLoad = whenever a user sees a variant, this callback will return an object:
 ```
 {
  "userId": <userId assigned to visitor>,
  "experiment": name of experiment,
  "variant": name of variant,
  "time": timestamp of the initial load
 }
 ```
 
 caveats: Callbacks will not fire if using a URL override
 
