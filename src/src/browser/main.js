"use strict";

(function()
{
    /** @const */
    var ON_LOCALHOST = !location.hostname.endsWith("copy.sh");

    /** @const */
    var HOST = ON_LOCALHOST ? "" : "//i.copy.sh/";

    /** @const */
    var ON_HTTPS = location.protocol === "https:";

    /** @const */
    var OTHER_HOST = ON_LOCALHOST ? "" : ON_HTTPS ? "//j.copy.sh:8443/" : "//j.copy.sh:8880/";

    var ctrl=false;

    var alt=false;

    var mouse_locked=false;
    /**
     * @return {Object.<string, string>}
     */

     var in_loading=0;

    const customTitlebar = require('custom-electron-titlebar');
    const electron = require('electron');

    var title_bar=document.getElementsByClassName('window-title')[0];
    function get_query_arguments()
    {
        var query = location.search.substr(1).split("&");
        var parameters = {};

        for(var i = 0; i < query.length; i++)
        {
            var param = query[i].split("=");
            parameters[param[0]] = decodeURIComponent(param[1]);
        }

        return parameters;
    }

    function chr_repeat(chr, count)
    {
        var result = "";

        while(count-- > 0)
        {
            result += chr;
        }

        return result;
    }

    var progress_ticks = 0;

    function show_progress(e)
    {
        var el = $("loading");
        el.style.display = "flex";
        if(in_loading==0)
        {
          in_loading=1;
          electron.ipcRenderer.send('in-loading');
        }
        if(e.file_index === e.file_count - 1 && e.loaded >= e.total - 2048)
        {
            // last file is (almost) loaded
            in_loading=2;
            electron.ipcRenderer.send('in-started');
            return;
        }
    }

    function $(id)
    {
        var el = document.getElementById(id);

        if(!el)
        {
            dbg_log("Element with id `" + id + "` not found");
        }

        return el;
    }

    function onload()
    {
        if(!("responseType" in new XMLHttpRequest))
        {
            alert("Your browser is not supported " +
                  "because it doesn't have XMLHttpRequest.responseType");
            return;
        }

        var settings = {};

        $("start_emulation").onclick = function()
        {
            $("boot_options").style.display = "none";
            set_profile("custom");

            var images = [];
            var last_file;

            var floppy_file = $("floppy_image").files[0];
            if(floppy_file)
            {
                last_file = floppy_file;
                settings.fda = { buffer: floppy_file };
            }

            var hd_file = $("hd_image").files[0];
            if(hd_file)
            {
                last_file = hd_file;
                settings.hda = { buffer: hd_file };
            }

            if($("multiboot_image"))
            {
                var multiboot_file = $("multiboot_image").files[0];
                if(multiboot_file)
                {
                    last_file = multiboot_file;
                    settings.multiboot = { buffer: multiboot_file };
                }
            }

            start_emulation(settings);
        };
        var oses = [
            {
                id: "windows31",
                hda: {
                    "url": HOST + "src/windows31.img",
                    "size": 419070976,
                },
                boot_order: 0x312,
                name: "windows31",
            }
        ];

        var query_args = get_query_arguments();
        var profile = query_args["profile"];

        if(query_args["use_bochs_bios"])
        {
            settings.use_bochs_bios = true;
        }

        for(var i = 0; i < oses.length; i++)
        {
            var infos = oses[i];

            if(profile === infos.id)
            {
                start_profile(infos);
                return;
            }

            var element = $("start_" + infos.id);
            electron.ipcRenderer.on('start-emulation',function(){
              set_profile(oses[0].id);
              start_profile(oses[0]);
            });
            if(element)
            {
                element.onclick = function(infos, element)
                {
                    set_profile(infos.id);
                    element.blur();
                    start_profile(infos);
                }.bind(this, infos, element);
            }
        }

        if(profile === "custom")
        {
            if(query_args["hda.url"])
            {
                settings.hda = {
                    "size": parseInt(query_args["hda.size"], 10) || undefined,
                    "url": query_args["hda.url"],
                    "async": true,
                };
            }

            if(query_args["fda.url"])
            {
                settings.fda = {
                    "size": parseInt(query_args["fda.size"], 10) || undefined,
                    "url": query_args["fda.url"],
                    "async": true,
                };
            }

            if(settings.fda || settings.hda)
            {
                $("boot_options").style.display = "none";

                start_emulation(settings, done);
            }
        }

        function start_profile(infos)
        {
            $("boot_options").style.display = "none";

            settings.filesystem = infos.filesystem;

            if(infos.state)
            {
                $("reset").style.display = "none";
                settings.initial_state = infos.state;
            }

            settings.fda = infos.fda;
            settings.cdrom = infos.cdrom;
            settings.hda = infos.hda;
            settings.multiboot = infos.multiboot;

            settings.memory_size = infos.memory_size;
            settings.vga_memory_size = infos.vga_memory_size;

            settings.id = infos.id;

            if(infos.boot_order !== undefined)
            {
                settings.boot_order = infos.boot_order;
            }

            start_emulation(settings, done);
        }

        function done(emulator)
        {
            if(query_args["c"])
            {
                setTimeout(function()
                {
                    //emulator.serial0_send(query_args["c"] + "\n");
                    emulator.keyboard_send_text(query_args["c"] + "\n");
                }, 25);
            }
        }
    }


    window.addEventListener("load", onload, false);

    // old webkit fires popstate on every load, fuck webkit
    // https://code.google.com/p/chromium/issues/detail?id=63040
    window.addEventListener("load", function()
    {
        setTimeout(function()
        {
            window.addEventListener("popstate", onpopstate);
        }, 0);
    });

    // works in firefox and chromium
    if(document.readyState === "complete")
    {
        onload();
    }

    /** @param {?=} done */
    function start_emulation(settings, done)
    {
        /** @const */
        var MB = 1024 * 1024;

        var memory_size = settings.memory_size;

        if(!memory_size)
        {
            memory_size = parseInt($("memory_size").value, 10) * MB;

            if(!memory_size)
            {
                alert("Invalid memory size - reset to 128MB");
                memory_size = 128 * MB;
            }
        }

        var vga_memory_size = settings.vga_memory_size;

        if(!vga_memory_size)
        {
            vga_memory_size = parseInt($("video_memory_size").value, 10) * MB;

            if(!vga_memory_size)
            {
                alert("Invalid video memory size - reset to 8MB");
                vga_memory_size = 8 * MB;
            }
        }

        if(!settings.fda)
        {
            var floppy_file = $("floppy_image").files[0];
            if(floppy_file)
            {
                settings.fda = { buffer: floppy_file };
            }
        }

        /** @const */
        var BIOSPATH = "bios/";

        if(settings.use_bochs_bios)
        {
            var biosfile = "bochs-bios.bin";
            var vgabiosfile = "bochs-vgabios.bin";
        }
        else
        {
            var biosfile = "seabios.bin";
            var vgabiosfile = "vgabios.bin";
        }

        var bios;
        var vga_bios;

        // a bios is only needed if the machine is booted
        if(!settings.initial_state)
        {
            bios = {
                "url": "src/" + BIOSPATH + biosfile,
            };
            vga_bios = {
                "url": "src/" +  BIOSPATH + vgabiosfile,
            };
        }

        var emulator = new V86Starter({
            "memory_size": memory_size,
            "vga_memory_size": vga_memory_size,

            "screen_container": $("screen_container"),
            "serial_container": $("serial"),

            "boot_order": settings.boot_order || parseInt($("boot_order").value, 16) || 0,

            "network_relay_url": "wss://relay.widgetry.org/",
            //"network_relay_url": "ws://localhost:8001/",

            "bios": bios,
            "vga_bios": vga_bios,

            "fda": settings.fda,
            "hda": settings.hda,
            "cdrom": settings.cdrom,

            "multiboot": settings.multiboot,

            "initial_state": settings.initial_state,
            "filesystem": settings.filesystem || {},

            "autostart": true,
        });

        if(DEBUG) window["emulator"] = emulator;

        emulator.add_listener("emulator-ready", function()
        {

            init_ui(settings, emulator);

            done && done(emulator);
        });

        emulator.add_listener("download-progress", function(e)
        {
            show_progress(e);
        });

        emulator.add_listener("download-error", function(e)
        {
        });
    }

    /**
     * @param {Object} settings
     * @param {V86Starter} emulator
     */
    function init_ui(settings, emulator)
    {
        $("boot_options").style.display = "none";
        $("loading").style.display = "none";
        $("runtime_options").style.display = "block";
        $("screen_container").style.display = "block";

        electron.ipcRenderer.on('pause',function(){
            if(emulator.is_running())
            {
                title_bar.innerText="windows31 (Stopped)";
                emulator.stop();
            }
            else
            {
                title_bar.innerText="windows31";
                emulator.run();
            }
        });

        electron.ipcRenderer.on('stop',function(){
            emulator.stop();
            location.href = location.pathname;
        });

        electron.ipcRenderer.on('lock-mouse',function(){
            if(!mouse_is_enabled)
            {
                mouse_is_enabled = !mouse_is_enabled;
                emulator.mouse_set_status(mouse_is_enabled);
            }
            emulator.lock_mouse();
        });

        var mouse_is_enabled = false;

        function toggle_mouse()
        {
            mouse_is_enabled = !mouse_is_enabled;
            emulator.mouse_set_status(mouse_is_enabled);
        };

        var last_tick = 0;
        var running_time = 0;
        var last_instr_counter = 0;
        var interval;
		var os_uses_mouse = false;
		if(mouse_is_enabled==true)mouse_is_enabled=false;
		emulator.mouse_set_status(mouse_is_enabled);
		document.exitPointerLock();
		mouse_locked=false;

        function update_info()
        {
            var now = Date.now();

            var instruction_counter = emulator.get_instruction_counter();
            var last_ips = instruction_counter - last_instr_counter;

            last_instr_counter = instruction_counter;

            var delta_time = now - last_tick;
            running_time += delta_time;
            last_tick = now;

            if(title_bar.innerText!=="windows31 (Stopped)")title_bar.innerText = "windows31 (Speed: " + (last_ips / delta_time | 0) + " kIPS, AVG Speed: " + (instruction_counter / running_time | 0) + " kIPS)";
        }

        emulator.add_listener("emulator-started", function()
        {
            last_tick = Date.now();
            interval = setInterval(update_info, 1000);
        });

        emulator.add_listener("emulator-stopped", function()
        {
            update_info();
            clearInterval(interval);
        });

        emulator.add_listener("9p-read-start", function()
        {
        });
        emulator.add_listener("9p-read-end", function(args)
        {
        });
        emulator.add_listener("9p-write-end", function(args)
        {
        });

        emulator.add_listener("ide-read-start", function()
        {
        });
        emulator.add_listener("ide-read-end", function(args)
        {
        });
        emulator.add_listener("ide-write-end", function(args)
        {
        });
        emulator.add_listener("eth-receive-end", function(args)
        {
        });
        emulator.add_listener("eth-transmit-end", function(args)
        {
        });
        emulator.add_listener("mouse-enable", function(is_enabled)
        {
        });

        emulator.add_listener("screen-set-mode", function(is_graphical)
        {
        });
        emulator.add_listener("screen-set-size-graphical", function(args)
        {
        });

        electron.ipcRenderer.on('reset',function(){
            emulator.restart();
        });

        add_image_download_button(settings.hda, "hda");
        add_image_download_button(settings.hdb, "hdb");
        add_image_download_button(settings.fda, "fda");
        add_image_download_button(settings.fdb, "fdb");
        add_image_download_button(settings.cdrom, "cdrom");

        function add_image_download_button(obj, type)
        {
            var elem = $("get_" + type + "_image");

            if(!obj || obj.size > 100 * 1024 * 1024)
            {
                elem.style.display = "none";
                return;
            }

            elem.onclick = function(e)
            {
                let buffer = emulator.disk_images[type];
                let filename = settings.id + (type === "cdrom" ? ".iso" : ".img");

                if(buffer.get_as_file)
                {
                    var file = buffer.get_as_file(filename);
                    download(file, filename);
                }
                else
                {
                    buffer.get_buffer(function(b)
                    {
                        if(b)
                        {
                            dump_file(b, filename);
                        }
                        else
                        {
                            alert("The file could not be loaded. Maybe it's too big?");
                        }
                    });
                }

                elem.blur();
            };
        }
        $("save_state").onclick = function()
        {
            emulator.save_state(function(error, result)
            {
                if(error)
                {
                    console.log(error.stack);
                    console.log("Couldn't save state: ", error);
                }
                else
                {
                    dump_file(result, "v86state.bin");
                }
            });

            $("save_state").blur();
        };

        $("load_state").onclick = function()
        {
            $("load_state_input").click();
            $("load_state").blur();
        };

        $("load_state_input").onchange = function()
        {
            var file = this.files[0];

            if(!file)
            {
                return;
            }

            var was_running = emulator.is_running();

            if(was_running)
            {
                emulator.stop();
            }

            var filereader = new FileReader();
            filereader.onload = function(e)
            {
                try
                {
                    emulator.restore_state(e.target.result);
                }
                catch(err)
                {
                    alert("Something bad happened while restoring the state:\n" + err + "\n\n" +
                          "Note that the current configuration must be the same as the original");
                    throw err;
                }

                if(was_running)
                {
                    emulator.run();
                }
            };
            filereader.readAsArrayBuffer(file);

            this.value = "";
        };

        $("ctrlaltdel").onclick = function()
        {
            emulator.keyboard_send_scancodes([
                0x1D, // ctrl
                0x38, // alt
                0x53, // delete

                // break codes
                0x1D | 0x80,
                0x38 | 0x80,
                0x53 | 0x80,
            ]);

            $("ctrlaltdel").blur();
        };

        $("alttab").onclick = function()
        {
            emulator.keyboard_send_scancodes([
                0x38, // alt
                0x0F, // tab
            ]);

            setTimeout(function()
            {
                emulator.keyboard_send_scancodes([
                    0x38 | 0x80,
                    0x0F | 0x80,
                ]);
            }, 100);

            $("alttab").blur();
        };

        $("scale").onchange = function()
        {
            var n = parseFloat(this.value);

            if(n || n > 0)
            {
                emulator.screen_set_scale(n, n);
            }
        };

        $("screen_container").onclick = function()
        {
            if(mouse_is_enabled==false)mouse_is_enabled=true;
            emulator.lock_mouse();
            emulator.mouse_set_status(mouse_is_enabled);
            mouse_locked=true;
        };

        const phone_keyboard = document.getElementsByClassName("phone_keyboard")[0];

        phone_keyboard.setAttribute("autocorrect", "off");
        phone_keyboard.setAttribute("autocapitalize", "off");
        phone_keyboard.setAttribute("spellcheck", "false");
        phone_keyboard.tabIndex = 0;

        $("screen_container").addEventListener("mousedown", (e) =>
        {
            phone_keyboard.focus();
        }, false);

        $("take_screenshot").onclick = function()
        {
            emulator.screen_make_screenshot();

            $("take_screenshot").blur();
        };

        window.addEventListener("keydown", unlock_mouse_test, false);
        window.addEventListener("keydown", downkey, false);
        window.addEventListener("keyup", upkey, false);

        function unlock_mouse_test(e)
        {
            if(e.key=="Escape" || e.code=="Escape" || e.keyCode==27 || e.keyCode==91 || e.keyCode==92)
            {
                if(mouse_is_enabled==true)mouse_is_enabled=false;
                emulator.mouse_set_status(mouse_is_enabled);
                document.exitPointerLock();
                mouse_locked=false;
            }
        }
        function downkey(e)
        {
          if(e.keyCode==17)
          {
            ctrl=true;
          }
          else if(e.keyCode==18)
          {
            alt=true;
          }
          if(ctrl==true && alt==true)
          {
              if(mouse_locked==true)
              {
                if(mouse_is_enabled==true)mouse_is_enabled=false;
                emulator.mouse_set_status(mouse_is_enabled);
                document.exitPointerLock();
                mouse_locked=false;
              }
              else
              {
                if(mouse_is_enabled==false)mouse_is_enabled=true;
                emulator.lock_mouse();
                emulator.mouse_set_status(mouse_is_enabled);
                mouse_locked=true;
              }
          }
		  console.log(e.keyCode);
        }
        function upkey(e)
        {
          if(e.keyCode==17)
          {
            ctrl=false;
          }
          else if(e.keyCode==18)
          {
            alt=false;
          }
        }
    }

    function onpopstate(e)
    {
        location.reload();
    }

    function set_profile(prof)
    {
        if(window.history.pushState)
        {
            window.history.pushState({ profile: prof }, "", "?profile=" + prof);
        }

    }

})();
