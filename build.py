import json
import os
import subprocess
import sys

from pathlib import Path
from typing import Optional
from datetime import datetime

from dotenv import load_dotenv

load_dotenv()

KEY_FILENAME: str = 'zoe-track.key'
BUILD_COMMAND: str = 'npm run tauri build'
VERSION_FILE: str = 'latest.json'
GITHUB_LATEST_URL: str = 'https://github.com/wrrulosdev/zoe-track/releases/latest/download'


class Platforms:
    WINDOWS: dict = {
        'enabled': True,
        'sig_folder': 'msi',
        'targetName': 'windows-x86_64',
        'url': f'{GITHUB_LATEST_URL}/zoe-track.msi'
    }
    LINUX: dict = {
        'enabled': False,
        'sig_folder': '',
        'targetName': 'linux-x86_64',
        'url': ''
    }
    MAC: dict = {
        'enabled': False,
        'sig_folder': '',
        'targetName': 'darwin-x86_64',
        'url': ''
    }


class TauriBuilder:
    def __init__(self) -> None:
        """
        Initialize the TauriBuilder with the key filename and an optional password.

        :param key_filename: Name of the private key file located in the .tauri directory.
        :param password: Password for the private key. If None, the script will prompt for it.
        """
        self.key_path: Path = Path.home() / ".tauri" / KEY_FILENAME
        self.private_key_password: str = os.getenv('TAURI_SIGNING_PRIVATE_KEY_PASSWORD')

        if self.private_key_password is None:
            print(f'Private Key password not found.')
            sys.exit(0)

    def _prompt_password(self) -> str:
        """
        Prompt the user to enter the password for the private key.

        :return: The entered password as a string.
        """
        return input("Enter the password for the private key: ")

    def generate_key_if_missing(self) -> None:
        """ Generate a new private key if it does not exist. """
        if self.key_path.exists():
            return

        print(f'Private key not found at {self.key_path}. Generating a new key...')

        try:
            subprocess.run(f'npm run tauri signer generate -- -w {self.key_path} --password {self.private_key_password}', shell=True)
            print('[+] Private key generated successfully.')

        except subprocess.CalledProcessError as e:
            print(f'Key generation failed with error: {e}')
            sys.exit(1)

    def set_environment_variables(self) -> None:
        """ Set the necessary environment variables for Tauri's signing process.  """
        try:
            with self.key_path.open("r", encoding="utf-8") as key_file:
                private_key_content: str = key_file.read()

            os.environ["TAURI_SIGNING_PRIVATE_KEY"] = private_key_content
            os.environ["TAURI_SIGNING_PRIVATE_KEY_PASSWORD"] = self.private_key_password
            print('Environment variables set successfully.')

        except Exception as e:
            print(f"Error setting environment variables: {e}")
            sys.exit(1)

    def build_application(self) -> None:
        """ Execute the Tauri build command to compile the application. """
        try:
            print('Starting Tauri build process...')
            subprocess.run(BUILD_COMMAND, shell=True)
            print('Tauri build completed successfully.')

        except subprocess.CalledProcessError as e:
            print(f'Build process failed with error: {e}')
            sys.exit(1)

    def _generate_version_file(self) -> None:
        version: str = ''

        with open('package.json', 'r', encoding='utf-8') as f:
            version = json.load(f).get('version')

        notes: str = input('Write the content of the notes section: ')
        pub_date: str = datetime.utcnow().replace(microsecond=0).isoformat() + 'Z'
        version_file: dict = {
            'version': version,
            'notes': notes,
            'pub_date': pub_date,
            'platforms': {}
        }

        for platform, value in Platforms.__dict__.items():
            if platform.startswith("__"):
                continue

            if not value['enabled']:
                continue

            bundle_folder: str = os.path.join('src-tauri', 'target', 'release', 'bundle', value['sig_folder'])
            bundle_files: list = os.listdir(bundle_folder)
            sig_file: Optional[str] = next((f for f in bundle_files if f.endswith('.sig')), None)

            if sig_file is None:
                print(f'[-] Sig file for {platform} not found!')
                sys.exit(1)

            sig_content: str = open(os.path.join(bundle_folder, sig_file), 'r', encoding='utf-8').read()
            version_file['platforms'][value['targetName']] = {
                "signature": sig_content,
                "url": value['url']
            }

        with open('version.json', 'w', encoding='utf-8') as f:
            json.dump(version_file, f, ensure_ascii=False, indent=2)

    def execute(self) -> None:
        """
        Execute the full process: generate key if missing, set environment variables,
        build the application, and sign the installer.
        """
        self.generate_key_if_missing()
        self.set_environment_variables()
        self.build_application()
        self._generate_version_file()
        input("Press Enter to exit...")


if __name__ == "__main__":
    builder: TauriBuilder = TauriBuilder()
    builder.execute()
