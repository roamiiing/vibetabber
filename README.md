# vibetabber

Chrome extension for managing tabs like Arc.

## Development

- Install dependencies with:
    ```sh
    npm ci
    ```
- Build and run extension
    - On MacOS:
        ```sh
        npm run build && /Applications/Chromium.app --load-extension="~/dev/vibetabber/dist"`
        ```
    - On Windows + WSL:
        ```powershell
        npm run build && /mnt/c/Program\ Files/Google/Chrome/Application/chrome.exe --load-extension="\\\\wsl.localhost\fedora\home\roam\dev\vibetabber\dist"
        ```

## TODO

- Basic functionality
    - [ ] Right click to open context menu
    - [ ] Drag'n'drop to move and pin tabs
    - [ ] Folders
- Research
    - [x] Restore tabs on chrome reopen (are tab IDs the same?)
        - [ ] No, they are not. Ask users to set their settings to not restore automatically
    - [ ] Are there events that fire on closing chrome _before_ `tabs.onRemove`
    - [ ] WebLLM for generating tab titles based on content
- Beautify
    - [ ] Customizable UI
- Testing
    - [ ] Test how closing chrome works when a tab `alert`s on `beforeunload`
