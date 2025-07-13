SHELL:=/bin/bash

prod:
	cd dist	&& zip -r ../publish.zip .

