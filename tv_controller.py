#!/usr/bin/env python3
"""
Samsung Smart TV Controller
Supports: Wake-on-LAN, Samsung WebSocket API, Chromecast
"""

import asyncio
import json
import base64
import socket
import ssl
import sys
from typing import Optional

# ============================================
# TV Configuration
# ============================================
TV_NAME = "Absolutely Massive TV"
TV_IP = "192.168.0.135"
TV_MAC = "6c:70:cb:a4:66:b4"
APP_NAME = "PythonRemote"


# ============================================
# Wake-on-LAN
# ============================================

def wake_on_lan(mac_address: str = TV_MAC):
    """Send Wake-on-LAN magic packet to turn on the TV."""
    mac = mac_address.replace(":", "").replace("-", "")
    if len(mac) != 12:
        raise ValueError(f"Invalid MAC address: {mac_address}")

    mac_bytes = bytes.fromhex(mac)
    magic_packet = b'\xff' * 6 + mac_bytes * 16

    sock = socket.socket(socket.AF_INET, socket.SOCK_DGRAM)
    sock.setsockopt(socket.SOL_SOCKET, socket.SO_BROADCAST, 1)
    sock.sendto(magic_packet, ('255.255.255.255', 9))
    sock.close()
    print(f"✅ Wake-on-LAN packet sent to {mac_address}")


# ============================================
# Chromecast Control
# ============================================

class ChromecastController:
    """Control Samsung TV via built-in Chromecast."""

    def __init__(self, ip: str = TV_IP):
        self.ip = ip
        self.cast = None
        self._browser = None

    def connect(self):
        """Connect to the Chromecast."""
        try:
            import pychromecast
        except ImportError:
            print("❌ Install: pip install pychromecast")
            return False

        print(f"🔌 Connecting to Chromecast at {self.ip}...")

        try:
            casts, browser = pychromecast.get_chromecasts(timeout=10)
            self._browser = browser

            for cc in casts:
                info = cc.cast_info
                if str(info.host) == str(self.ip):
                    self.cast = cc
                    self.cast.wait(timeout=10)
                    print(f"✅ Connected to: {cc.name}")
                    return True

            print(f"⚠️  No Chromecast found at {self.ip}")
            pychromecast.discovery.stop_discovery(browser)
            return False

        except Exception as e:
            print(f"❌ Connection failed: {e}")
            return False

    def disconnect(self):
        """Disconnect from Chromecast."""
        if self._browser:
            try:
                import pychromecast
                pychromecast.discovery.stop_discovery(self._browser)
            except:
                pass
        if self.cast:
            try:
                self.cast.disconnect()
            except:
                pass
            self.cast = None

    def get_status(self) -> dict:
        """Get current status."""
        if not self.cast:
            return {}
        return {
            "name": self.cast.name,
            "app": self.cast.app_display_name,
            "standby": self.cast.status.is_stand_by if self.cast.status else None,
            "volume": int(self.cast.status.volume_level * 100) if self.cast.status else None,
            "muted": self.cast.status.volume_muted if self.cast.status else None,
        }

    def play_url(self, url: str, content_type: str = "video/mp4"):
        """Cast a URL to the TV."""
        if not self.cast:
            return False
        mc = self.cast.media_controller
        mc.play_media(url, content_type)
        mc.block_until_active()
        print(f"▶️ Playing: {url}")
        return True

    def play(self):
        if self.cast:
            self.cast.media_controller.play()

    def pause(self):
        if self.cast:
            self.cast.media_controller.pause()

    def stop(self):
        if self.cast:
            self.cast.media_controller.stop()

    def set_volume(self, level: float):
        """Set volume (0.0 - 1.0)."""
        if self.cast:
            self.cast.set_volume(level)
            print(f"🔊 Volume: {int(level * 100)}%")

    def volume_up(self):
        if self.cast and self.cast.status:
            self.set_volume(min(1.0, self.cast.status.volume_level + 0.1))

    def volume_down(self):
        if self.cast and self.cast.status:
            self.set_volume(max(0.0, self.cast.status.volume_level - 0.1))


# ============================================
# Samsung WebSocket Remote Control
# ============================================

class SamsungRemote:
    """Control Samsung TV via WebSocket API (2016+ models)."""

    KEYS = {
        "power": "KEY_POWER", "poweroff": "KEY_POWEROFF",
        "up": "KEY_UP", "down": "KEY_DOWN", "left": "KEY_LEFT", "right": "KEY_RIGHT",
        "enter": "KEY_ENTER", "return": "KEY_RETURN", "exit": "KEY_EXIT",
        "home": "KEY_HOME", "menu": "KEY_MENU", "source": "KEY_SOURCE",
        "volup": "KEY_VOLUP", "voldown": "KEY_VOLDOWN", "mute": "KEY_MUTE",
        "chup": "KEY_CHUP", "chdown": "KEY_CHDOWN",
        "0": "KEY_0", "1": "KEY_1", "2": "KEY_2", "3": "KEY_3", "4": "KEY_4",
        "5": "KEY_5", "6": "KEY_6", "7": "KEY_7", "8": "KEY_8", "9": "KEY_9",
        "play": "KEY_PLAY", "pause": "KEY_PAUSE", "stop": "KEY_STOP",
        "red": "KEY_RED", "green": "KEY_GREEN", "yellow": "KEY_YELLOW", "blue": "KEY_BLUE",
        "apps": "KEY_APPS", "info": "KEY_INFO", "guide": "KEY_GUIDE",
    }

    APPS = {
        "netflix": "3201907018807", "youtube": "111299001912",
        "prime": "3201910019365", "disney": "3201901017640",
        "plex": "3201512006963", "spotify": "3201606009684",
    }

    def __init__(self, ip: str = TV_IP, port: int = 8002):
        self.ip = ip
        self.port = port
        self.ws = None
        self._token = None

    def _get_url(self) -> str:
        name_b64 = base64.b64encode(APP_NAME.encode()).decode()
        url = f"wss://{self.ip}:{self.port}/api/v2/channels/samsung.remote.control?name={name_b64}"
        if self._token:
            url += f"&token={self._token}"
        return url

    async def connect(self) -> bool:
        try:
            import websockets
        except ImportError:
            print("❌ Install: pip install websockets")
            return False

        print(f"🔌 Connecting to Samsung TV at {self.ip}...")

        try:
            ssl_ctx = ssl.create_default_context()
            ssl_ctx.check_hostname = False
            ssl_ctx.verify_mode = ssl.CERT_NONE

            self.ws = await websockets.connect(
                self._get_url(), ssl=ssl_ctx, open_timeout=5, close_timeout=5
            )

            response = await asyncio.wait_for(self.ws.recv(), timeout=10)
            data = json.loads(response)

            if data.get("event") == "ms.channel.connect":
                self._token = data.get("data", {}).get("token")
                print("✅ Connected to Samsung TV!")
                if not self._token:
                    print("⚠️  Check TV - you may need to allow the connection")
                return True
            return False

        except Exception as e:
            print(f"❌ Connection failed: {e}")
            print("💡 Make sure TV is ON and remote control is enabled:")
            print("   Settings > General > External Device Manager > Device Connection Manager")
            return False

    async def disconnect(self):
        if self.ws:
            await self.ws.close()
            self.ws = None

    async def send_key(self, key: str):
        if not self.ws:
            return False
        key_code = self.KEYS.get(key.lower(), f"KEY_{key.upper()}")
        payload = {
            "method": "ms.remote.control",
            "params": {
                "Cmd": "Click", "DataOfCmd": key_code,
                "Option": "false", "TypeOfRemote": "SendRemoteKey"
            }
        }
        await self.ws.send(json.dumps(payload))
        print(f"📺 Sent: {key_code}")
        return True

    async def launch_app(self, app_name: str):
        if not self.ws:
            return False
        app_id = self.APPS.get(app_name.lower(), app_name)
        payload = {
            "method": "ms.channel.emit",
            "params": {
                "event": "ed.apps.launch", "to": "host",
                "data": {"appId": app_id, "action_type": "DEEP_LINK"}
            }
        }
        await self.ws.send(json.dumps(payload))
        print(f"📺 Launching: {app_name}")
        return True


# ============================================
# Main CLI
# ============================================

def print_help():
    print("""
Samsung TV Controller - Commands:
  wake              Turn on TV via Wake-on-LAN
  status            Get Chromecast status
  volup/voldown     Adjust volume
  play/pause/stop   Media controls
  cast <url>        Cast a video URL

Samsung Remote (requires TV to be ON):
  key <name>        Send key (power, up, down, enter, volup, mute, etc.)
  app <name>        Launch app (netflix, youtube, prime, disney, plex)
""")


def cmd_status():
    cc = ChromecastController()
    if cc.connect():
        status = cc.get_status()
        print(f"📺 Status: {json.dumps(status, indent=2)}")
        cc.disconnect()


def cmd_volume(direction: str):
    cc = ChromecastController()
    if cc.connect():
        if direction == "up":
            cc.volume_up()
        else:
            cc.volume_down()
        cc.disconnect()


def cmd_cast(url: str):
    cc = ChromecastController()
    if cc.connect():
        cc.play_url(url)
        print("(Chromecast will stay connected for playback)")


async def cmd_key(key: str):
    remote = SamsungRemote()
    if await remote.connect():
        await remote.send_key(key)
        await asyncio.sleep(0.3)
        await remote.disconnect()


async def cmd_app(app: str):
    remote = SamsungRemote()
    if await remote.connect():
        await remote.launch_app(app)
        await asyncio.sleep(1)
        await remote.disconnect()


def main():
    print("=" * 50)
    print(f"🖥️  {TV_NAME}")
    print(f"   {TV_IP} ({TV_MAC})")
    print("=" * 50)

    if len(sys.argv) < 2:
        print_help()
        return

    cmd = sys.argv[1].lower()

    if cmd == "wake":
        wake_on_lan()
    elif cmd == "status":
        cmd_status()
    elif cmd == "volup":
        cmd_volume("up")
    elif cmd == "voldown":
        cmd_volume("down")
    elif cmd == "cast" and len(sys.argv) > 2:
        cmd_cast(sys.argv[2])
    elif cmd == "key" and len(sys.argv) > 2:
        asyncio.run(cmd_key(sys.argv[2]))
    elif cmd == "app" and len(sys.argv) > 2:
        asyncio.run(cmd_app(sys.argv[2]))
    elif cmd == "help":
        print_help()
    else:
        print(f"Unknown command: {cmd}")
        print_help()


if __name__ == "__main__":
    main()
