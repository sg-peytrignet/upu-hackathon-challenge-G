# GeoPostal Insight

Challenge G: Post office, postal service and digital service mapping platform.

For details visit our [dribdat page](https://dribdat.hackathon.post/project/22).

# Data

Our project investigates postal services in Brazil as a use case. A Data Package with a small extract from the UPU statistics portal is available here. We are also sharing archival data from the UPU that was provided to us at the hackathon. Please do not assume that any of this is open access: contact UPU for permission to reuse.

# Installation

Install [Miniconda](https://docs.anaconda.com/free/miniconda/miniconda-install/) or Anaconda, then:

`conda env create -n post -f requirements.txt`

`conda activate post`

Open the root folder in Jupyter to explore our notebooks, or launch in dashboard mode with:

`panel serve geopostal.ipynb`

In development, you might find the `--autoreload` parameter useful.
