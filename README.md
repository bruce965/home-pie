Home Pie
========

HomePie, your personal cloud desktop running on your own network.

***THIS IS STILL A VERY EARLY PROTOTYPE***

![Screenshot](https://github.com/bruce965/home-pie/assets/992536/96b2464e-f989-46be-b57c-4852a04e9497)


## Building

In order to build Home Pie, first install [Docker](https://www.docker.com/)
and [Git](https://git-scm.com/), then run the following commands:

```bash
git clone https://github.com/bruce965/home-pie.git
cd home-pie
docker build . -t home-pie:dev
```

You can now run Home Pie with the following command:

```bash
docker run --rm -it -v=/:/mnt/host -p=80 -p:443 home-pie:dev
```

This will start a local server, you can access it by typing
[localhost](http://localhost) in your local browser's navigation bar.

> Note: on Windows, cloning and building can be done from any path, but the
> server requires a Linux host, so please launch it from inside WSL2.


## Development

WSL2 required to develop on Windows, not tested on MacOS.

Besides all the [building](#building) requirements, I would also recommend to
install [Visual Studio Code](https://code.visualstudio.com/), with all the
extensions listed in the [_extensions.json_](.vscode/extensions.json) file.

After cloning this repository, you can start a local development server on
http://localhost:8080 by running `./start-dev.sh`.


## License

Source code in this repository is licensed under the [MIT license](LICENSE).

Some files may be licensed under different terms, refer to each individual file
for file-specific licenses.
