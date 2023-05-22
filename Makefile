BUILDDIR := build/
NAME     := endlesswhisper
VERSION  := $(shell cat src/manifest.json | \
              sed -n 's/^ *"version": *"\([0-9.]\+\)".*/\1/p' | \
              head -n1)

all: prepare chrome

prepare:
	mkdir -p build

chrome: prepare
	rm -f ${BUILDDIR}${NAME}-${VERSION}.zip
	zip -9r ${BUILDDIR}${NAME}-${VERSION}.zip src

clean:
	rm -rf ${BUILDDIR}
