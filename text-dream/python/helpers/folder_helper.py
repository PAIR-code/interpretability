"""Handles the folder setup related functions."""
import datetime
import os
from google3.pyglib import gfile


def make_folder_if_not_exists(folder_path):
  """Create a folder if it does not already exist.

  Args:
    folder_path: The path to the folder to create.
  """
  if not gfile.IsDirectory(folder_path):
    gfile.MkDir(folder_path)


def make_timestamp_directory(base_path, prefix=''):
  """Make a directory named after the current timestamp at a given path.

  Args:
    base_path: The path to place the directory at.
    prefix: Optional prefix to pack before the directory timestamp.

  Returns:
    path: The path of the newly created directory.
  """
  now = datetime.datetime.now()
  now = str(now).replace(' ', '_')
  now = prefix + now
  path = os.path.join(base_path, now)
  make_folder_if_not_exists(path)
  return path
