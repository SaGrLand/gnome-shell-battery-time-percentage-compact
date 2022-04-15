var GObject = imports.gi.GObject;
const UPower = imports.gi.UPowerGlib;
const BaseIndicator = imports.ui.status.power.Indicator;

var Indicator = GObject.registerClass(
	{
	GTypeName: 'Indicator'
	},
	class Indicator extends BaseIndicator
	{
   _getBatteryStatus() {
      let seconds = 0;

      const percentage = Math.round(this._proxy.Percentage) + '%'

      // Ensure percentage label is enabled regardless of gsettings
      this._percentageLabel.visible = true

      if (this._proxy.State == UPower.DeviceState.FULLY_CHARGED) {
         return '\u221E';
      } else if (this._proxy.State == UPower.DeviceState.CHARGING) {
         seconds = this._proxy.TimeToFull;
      } else if (this._proxy.State == UPower.DeviceState.DISCHARGING) {
         seconds = this._proxy.TimeToEmpty;
      } else if (this._proxy.State == UPower.DeviceState.PENDING_CHARGE) {
         // 'not charging' (ThinkPad status charging-threshold reached) is treated as PENDING_CHARGE
         return _("~ (%s)").format(percentage);
      } else {
         // state is PENDING_DISCHARGE
         return _("… (%s)").format(percentage);
      }

      let time = Math.round(seconds / 60);
      if (time == 0) {
         // 0 is reported when UPower does not have enough data
         // to estimate battery life
         return _("… (%s)").format(percentage);
      }

      let minutes = time % 60;
      let hours = Math.floor(time / 60);

      // Translators: this is <hours>:<minutes>
      return _("%d\u2236%02d (%s)").format(hours, minutes, percentage);
   }

   _sync() {
      super._sync();
      this._percentageLabel.clutter_text.set_markup(this._getBatteryStatus());
   }
}
);
