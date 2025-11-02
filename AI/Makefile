IMAGE_NAME = ai-be
TAG = v1
PORT = 8000

.PHONY: build run stop clean

build:
	docker build -t $(IMAGE_NAME):$(TAG) .

run:
	docker run --rm -p $(PORT):$(PORT) -it $(IMAGE_NAME):$(TAG)

stop:
	docker stop $$(docker ps -q --filter ancestor=$(IMAGE_NAME):$(TAG))

clean:
	docker rm $$(docker ps -a -q --filter ancestor=$(IMAGE_NAME):$(TAG)) || true
	docker rmi $(IMAGE_NAME):$(TAG) || true
