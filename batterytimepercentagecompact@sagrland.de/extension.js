import {
   Extension as BaseExtension,
   InjectionManager
} from 'resource:///org/gnome/shell/extensions/extension.js';// import {overrideProto} from './util.js'
import {panel} from 'resource:///org/gnome/shell/ui/main.js';
import {Indicator} from 'resource:///org/gnome/shell/ui/status/system.js';
import UPower from 'gi://UPowerGlib';

const _powerToggleSyncOverride = function () {
   // Do we have batteries or a UPS?
   this.visible = this._proxy.IsPresent;
   if (!this.visible) {
      return false;
   }

   const percentage = Math.round(this._proxy.Percentage) + '%'
   let seconds = 0;
   let state = this._proxy.State;

   if (this._proxy.State == UPower.DeviceState.FULLY_CHARGED) {
         this.title = _('\u221E');
         return true;
   } else if (this._proxy.State === UPower.DeviceState.CHARGING) {
      seconds = this._proxy.TimeToFull;
   } else if (this._proxy.State === UPower.DeviceState.DISCHARGING) {
      seconds = this._proxy.TimeToEmpty;
   } else {
         // state is one of PENDING_CHARGING, PENDING_DISCHARGING
         this.title = _("… (%s)").format(percentage);
         return true;
   }

   // This can happen in various cases.
   if (seconds === 0) {
      return false;
   }

   let time = Math.round(seconds / 60);
   if (time == 0) {
         // 0 is reported when UPower does not have enough data
         // to estimate battery life
         this.title = _("… (%s)").format(percentage);
         return true;
   }
   let minutes = time % 60;
   let hours = Math.floor(time / 60);

   this.title = _('%d\u2236%02d (%s)').format(hours, minutes, percentage)

   return true;
};

export default class Extension extends BaseExtension {
   enable() {
      this._im = new InjectionManager();
      this._im.overrideMethod(Indicator.prototype, '_sync', function (_sync) {
         return function () {
            const {powerToggle} = this._systemItem;
            const hasOverride = _powerToggleSyncOverride.call(powerToggle);
            _sync.call(this);
            this._percentageLabel.visible = hasOverride;
         };
      });

      // This is called in case the extension is enabled after startup.
      // During startup, the _system indicator is not created at this point, yet.
      this._syncToggle();
   }

   disable() {
      this._im.clear();
      this._im = null;
      this._syncToggle();
   }

   _syncToggle() {
      if (panel.statusArea?.quickSettings?._system?._systemItem?.powerToggle) {
         panel.statusArea.quickSettings._system._systemItem.powerToggle._sync();
      }
   }
}
