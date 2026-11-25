/*
 * HTS Creative – "Sales Lead" field for HireHop jobs
 * ---------------------------------------------------
 * - Adds a free-text "Sales Lead" box to the job Edit form (next to the other
 *   custom fields, e.g. Commercial Status).
 * - Shows the Sales Lead in the orange job header bar, right after Project Manager.
 *
 * The value is stored as a job custom field called "hts_sales_lead", so it can
 * also be used in HireHop documents as:  job:_hts_sales_lead
 *
 * Install: host this file on an https:// address, then add that URL to
 * Settings > Company Settings > Plugins.
 */
(function ($) {
	"use strict";
	if (!$) return;

	var FIELD     = "hts_sales_lead";
	var LABEL     = "Sales Lead";
	var INPUT_ID  = "hts_sales_lead_input";
	var HEADER_ID = "hts_sales_lead_header";

	function readValue(raw) {
		if (raw === null || typeof raw === "undefined") return "";
		if (typeof raw === "object") return $.trim(raw.value || "");
		return $.trim(String(raw));
	}

	function valueFromJobData(data) {
		if (!data) return "";
		var cf = data.CUSTOM_FIELDS || data.fields;
		if (typeof cf === "string") {
			try { cf = JSON.parse(cf); } catch (e) { cf = null; }
		}
		return cf ? readValue(cf[FIELD]) : "";
	}

	/* ---------- 1. Orange header bar ---------- */

	function renderHeader() {
		if (typeof window.job_data !== "object" || !window.job_data) return;

		var pmCell = $(".data_cell[data-field='USER_NAME']").first().closest("td");
		if (!pmCell.length) return;
		var row = pmCell.closest("tr");

		var cell = $("#" + HEADER_ID);
		if (!cell.length) {
			cell = $("<td>").attr({ id: HEADER_ID, style: "text-align:center;white-space:nowrap" });
			$("<span class='lang'>").text(LABEL).appendTo(cell);
			$("<span class='hts_sales_lead_value'>").appendTo(cell);
			cell.insertAfter(pmCell);

			var cells = row.children("td");
			cells.css("width", (100 / cells.length).toFixed(2) + "%");
		}

		var name = valueFromJobData(window.job_data);
		cell.find(".hts_sales_lead_value")
			.text(name || "-")
			.css("opacity", name ? 1 : 0.5);
	}

	if (typeof window.fill_job_fields === "function" && !window.fill_job_fields._htsSalesLead) {
		var originalFill = window.fill_job_fields;
		window.fill_job_fields = function () {
			var result = originalFill.apply(this, arguments);
			try { renderHeader(); } catch (e) { console.error("[HTS Sales Lead]", e); }
			return result;
		};
		window.fill_job_fields._htsSalesLead = true;
	}
	$(function () { renderHeader(); setTimeout(renderHeader, 1000); });

	/* ---------- 2. Job Edit form ---------- */

	function addToEditForm(dialog) {
		var inst = $(dialog).data("customJob_edit");
		if (!inst) return;
		var container = inst.custom_fields_container;
		if (!container || !container.length) return;

		var input = container.find("#" + INPUT_ID);
		if (!input.length) {
			var box = $("<div class='custom_field_container half'>").attr("style",
				"border:collapse; align-self:center; display:inline-flex; " +
				"flex:1 0 calc(50% - 4px); max-width:calc(50% - 4px);");
			var label = $("<label class='label'>").attr("style",
				"display:flex; flex:1 1 100%; max-width:100%; align-items:center;")
				.text(LABEL + " : ").appendTo(box);
			input = $("<input type='text' class='custom_field' maxlength='60' autocomplete='off'>")
				.attr({ id: INPUT_ID, style: "flex:1; min-width:0;" })
				.appendTo(label);

			input.on("input change", function () {
				var editor = $(this).closest(".custom_jobEditFrame").data("customJob_edit");
				if (editor) {
					editor._save_custom_field_value(FIELD, { value: $.trim($(this).val()), type: "text" });
				}
			});

			container.prepend(box);
		}

		input.val(readValue(inst._get_custom_field_value(FIELD)));
	}

	$(document)
		.off("dialogopen.htsSalesLead")
		.on("dialogopen.htsSalesLead", ".custom_jobEditFrame", function () {
			var dialog = this;
			setTimeout(function () {
				try { addToEditForm(dialog); } catch (e) { console.error("[HTS Sales Lead]", e); }
			}, 0);
		})
		.on("dialogclose.htsSalesLead", ".custom_jobEditFrame", function () {
			setTimeout(renderHeader, 1500);
		});

})(window.jQuery);
