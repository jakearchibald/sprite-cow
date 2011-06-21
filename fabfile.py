# Fabric for deploying the spritecow app
import os
import datetime
import ConfigParser

from fabric.colors import yellow
from fabric.api import local, env

PROJECT_ROOT = os.path.dirname(os.path.realpath(__file__))
here = lambda *x: os.path.join(PROJECT_ROOT, *x)

config = ConfigParser.ConfigParser()
config.readfp(open('fabric.cfg'))

env.bucket = config.get('production', 'bucket')
env.git_url = config.get('production', 'git_url')
env.access_key = config.get('production', 'access_key')
env.secret_key = config.get('production', 'secret_key')

tmp_time = datetime.datetime.now()
env.time = tmp_time.strftime("%Y%m%d_%H%M%S")
env.clone_path = here('tmp', env.time )
env.htdocs = here('tmp', env.time, 'www')

def deploy():
    """Deployment actions into S3 using s3put"""
    local('mkdir -p %(clone_path)s' % env)
    local('git clone %(git_url)s  %(clone_path)s' % env)
    local('./s3put.py -a %(access_key)s -s %(secret_key)s -b %(bucket)s -p %(htdocs)s -g public-read %(htdocs)s' % env)
    print yellow("Done?")
