---
title: Build and flash firmware
description: Build the R1 firmware, point it at your server, and flash it onto the device.
---
Follow these steps to set up the R1 device firmware with the example project.

## Download and configure the device firmware

1. Clone the `bk_aidk` project from GitHub:

   ```shell
   git clone --recurse-submodules https://github.com/bekencorp/bk_aidk.git -b ai_release/v2.0.1
   cd bk_aidk
   git checkout ai_release/v2.0.1.8
   git submodule update --recursive
   ```

2. Replace the `projects` directory with the example demo directory. Replace `<bk_aidk_path>` with your actual path:

   ```shell
   rm -rf <bk_aidk_path>/projects/
   cp -r ./projects <bk_aidk_path>/projects
   ```

   > **Info**
   > To avoid conflicts, delete the original `projects` directory before copying.

3. Update the server URL in `projects/common_components/network_transfer/agora_rtc/agora_config.h` to point to your deployed server:

   ```c
   #define CONFIG_AGENT_SERVER_URL "http://192.168.1.100:5001"
   ```

   Replace `http://192.168.1.100:5001` with your server address.

## Build the firmware

Build the sample project firmware from the `bk_aidk` directory:

```shell
cd <bk_aidk_path>
make bk7258 PROJECT=beken_genie
```

Replace `<bk_aidk_path>` with your actual `bk_aidk` directory path.

## Flash the firmware

After the firmware builds successfully, flash it to your R1 device. For detailed instructions, see the [BK official documentation](https://docs.bekencorp.com/arminodoc/bk_idk/bk7258/en/v2.0.1/get-started/index.html).

## Related pages

- [Run the demo server](../baseline-bring-up/run-the-demo-server)
- [Run the R1 demo](../baseline-bring-up/run-the-r1-demo)
