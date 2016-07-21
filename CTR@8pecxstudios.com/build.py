#!/usr/bin/python

# Imports
import os, re, sys
from glob import glob
from zipfile import ZipFile, ZIP_STORED, ZIP_DEFLATED

# XPI package files, Note must update when adding or removing files.
resources = [
	"content/*",
	"content/cctr/*",
	"content/cctr/css/*",
	"content/cctr/fonts/*",
	"content/cctr/images/*",
	"content/cctr/js/*",
	"content/css/*",
	"content/css/cctr/*",
	"content/css/linux/*",
	"content/css/mac/*",
	"content/css/win8/*",
	"content/css/winaero/*",
	"content/images/*",
	"content/images/abouthome/*",
	"content/images/cctr/*",
	"defaults/preferences/options.js",
	"locale/*/*",
	"icon.png",
	"chrome.manifest",
	"install.rdf",
	]

# Zip package
class ZipOutFile(ZipFile):
    def __init__(self, zfile):
        ZipFile.__init__(self, zfile, "w", ZIP_DEFLATED)

    def __enter__(self):
        return self

    def __exit__(self, type, value, traceback):
        self.close()

# Enumerate resource files and folders.	
def get_files(resources):
    for file in resources:
        if os.path.isfile(file):
            yield file
            continue
        for name in glob(file):
            yield name

# Build XPI package.
def buildXPI( version ):
	destination = "xpi/CTR@8pecxstudios.com-" + version + ".xpi"
	# Check if the package already exists in our destination and remove it.
	if os.path.exists(destination):
		print("Found & removing: " + destination)
		os.remove(destination)
	print('Creating package please wait!')	
	with ZipOutFile(destination) as zip:
		for file in sorted(get_files(resources), key=str.lower):
			compress_type = ZIP_STORED if file.endswith(".png") else ZIP_DEFLATED
			print("Compressing: " + file)
			zip.write(file, compress_type=compress_type)		
	return;

# Since we use command line arguments we require two in total "build" & "0.0.0" (Version) for XPI package.	
if sys.argv[1] == "build":
	# Make XPI directory if not exists.
	if not os.path.exists("xpi"):
		os.makedirs("xpi")
	# Send version to build XPI package.
	buildXPI(sys.argv[2])
	print('Build complete!')
	sys.exit()
else:
	# If the above command line arguments were not set say goodbye.
	print('Invalid commands or failed build!')
	sys.exit()