## Linguistic Lens
Linguistic Lens is a visualization for understanding a generated dataset through through syntactic, lexical, and semantic lenses. 

The hosted demo with a few toy datasets is available [here](https://storage.googleapis.com/data-synth-trees/demo/index.html).

## Development
### Local server
To run a demo locally on the toy datasets, you must have yarn installed.

1) Install dependencies:

```yarn```

2) Run a local server

```yarn watch```

and navigate to [http://localhost:1234](http://localhost:1234).

### Running on your own dataset
Put your data in a csv in `input_data/`. Update the paths at the bottom of `preprocess_data.py`, and add the column header of the column you want to run the visualization on.

```
python -m venv env
source env/bin/activate
pip install -r requirements.txt
python preprocess_data.py
```

### Deploy (Big picture developers only)
To deploy the demo to google cloud, you must be a known big-picture developer with gcp permissions for the project. This script will not work for external users.

```sh ./deploy.sh --upload_jsons```
