/*
   Licensed to the Apache Software Foundation (ASF) under one or more
   contributor license agreements.  See the NOTICE file distributed with
   this work for additional information regarding copyright ownership.
   The ASF licenses this file to You under the Apache License, Version 2.0
   (the "License"); you may not use this file except in compliance with
   the License.  You may obtain a copy of the License at

       http://www.apache.org/licenses/LICENSE-2.0

   Unless required by applicable law or agreed to in writing, software
   distributed under the License is distributed on an "AS IS" BASIS,
   WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
   See the License for the specific language governing permissions and
   limitations under the License.
*/
var showControllersOnly = false;
var seriesFilter = "";
var filtersOnlySampleSeries = true;

/*
 * Add header in statistics table to group metrics by category
 * format
 *
 */
function summaryTableHeader(header) {
    var newRow = header.insertRow(-1);
    newRow.className = "tablesorter-no-sort";
    var cell = document.createElement('th');
    cell.setAttribute("data-sorter", false);
    cell.colSpan = 1;
    cell.innerHTML = "Requests";
    newRow.appendChild(cell);

    cell = document.createElement('th');
    cell.setAttribute("data-sorter", false);
    cell.colSpan = 3;
    cell.innerHTML = "Executions";
    newRow.appendChild(cell);

    cell = document.createElement('th');
    cell.setAttribute("data-sorter", false);
    cell.colSpan = 7;
    cell.innerHTML = "Response Times (ms)";
    newRow.appendChild(cell);

    cell = document.createElement('th');
    cell.setAttribute("data-sorter", false);
    cell.colSpan = 1;
    cell.innerHTML = "Throughput";
    newRow.appendChild(cell);

    cell = document.createElement('th');
    cell.setAttribute("data-sorter", false);
    cell.colSpan = 2;
    cell.innerHTML = "Network (KB/sec)";
    newRow.appendChild(cell);
}

/*
 * Populates the table identified by id parameter with the specified data and
 * format
 *
 */
function createTable(table, info, formatter, defaultSorts, seriesIndex, headerCreator) {
    var tableRef = table[0];

    // Create header and populate it with data.titles array
    var header = tableRef.createTHead();

    // Call callback is available
    if(headerCreator) {
        headerCreator(header);
    }

    var newRow = header.insertRow(-1);
    for (var index = 0; index < info.titles.length; index++) {
        var cell = document.createElement('th');
        cell.innerHTML = info.titles[index];
        newRow.appendChild(cell);
    }

    var tBody;

    // Create overall body if defined
    if(info.overall){
        tBody = document.createElement('tbody');
        tBody.className = "tablesorter-no-sort";
        tableRef.appendChild(tBody);
        var newRow = tBody.insertRow(-1);
        var data = info.overall.data;
        for(var index=0;index < data.length; index++){
            var cell = newRow.insertCell(-1);
            cell.innerHTML = formatter ? formatter(index, data[index]): data[index];
        }
    }

    // Create regular body
    tBody = document.createElement('tbody');
    tableRef.appendChild(tBody);

    var regexp;
    if(seriesFilter) {
        regexp = new RegExp(seriesFilter, 'i');
    }
    // Populate body with data.items array
    for(var index=0; index < info.items.length; index++){
        var item = info.items[index];
        if((!regexp || filtersOnlySampleSeries && !info.supportsControllersDiscrimination || regexp.test(item.data[seriesIndex]))
                &&
                (!showControllersOnly || !info.supportsControllersDiscrimination || item.isController)){
            if(item.data.length > 0) {
                var newRow = tBody.insertRow(-1);
                for(var col=0; col < item.data.length; col++){
                    var cell = newRow.insertCell(-1);
                    cell.innerHTML = formatter ? formatter(col, item.data[col]) : item.data[col];
                }
            }
        }
    }

    // Add support of columns sort
    table.tablesorter({sortList : defaultSorts});
}

$(document).ready(function() {

    // Customize table sorter default options
    $.extend( $.tablesorter.defaults, {
        theme: 'blue',
        cssInfoBlock: "tablesorter-no-sort",
        widthFixed: true,
        widgets: ['zebra']
    });

    var data = {"OkPercent": 100.0, "KoPercent": 0.0};
    var dataset = [
        {
            "label" : "FAIL",
            "data" : data.KoPercent,
            "color" : "#FF6347"
        },
        {
            "label" : "PASS",
            "data" : data.OkPercent,
            "color" : "#9ACD32"
        }];
    $.plot($("#flot-requests-summary"), dataset, {
        series : {
            pie : {
                show : true,
                radius : 1,
                label : {
                    show : true,
                    radius : 3 / 4,
                    formatter : function(label, series) {
                        return '<div style="font-size:8pt;text-align:center;padding:2px;color:white;">'
                            + label
                            + '<br/>'
                            + Math.round10(series.percent, -2)
                            + '%</div>';
                    },
                    background : {
                        opacity : 0.5,
                        color : '#000'
                    }
                }
            }
        },
        legend : {
            show : true
        }
    });

    // Creates APDEX table
    createTable($("#apdexTable"), {"supportsControllersDiscrimination": true, "overall": {"data": [1.0, 500, 1500, "Total"], "isController": false}, "titles": ["Apdex", "T (Toleration threshold)", "F (Frustration threshold)", "Label"], "items": [{"data": [1.0, 500, 1500, "GET /inventory-item.html-0"], "isController": false}, {"data": [1.0, 500, 1500, "GET /inventory-item.html-3"], "isController": false}, {"data": [1.0, 500, 1500, "05 Checkout Step One"], "isController": true}, {"data": [1.0, 500, 1500, "GET /inventory-item.html-1"], "isController": false}, {"data": [1.0, 500, 1500, "GET /inventory-item.html-2"], "isController": false}, {"data": [1.0, 500, 1500, "GET / (login)-0"], "isController": false}, {"data": [1.0, 500, 1500, "GET / (login)-1"], "isController": false}, {"data": [1.0, 500, 1500, "GET / (login)-2"], "isController": false}, {"data": [1.0, 500, 1500, "03 Inventory Item (product details)"], "isController": true}, {"data": [1.0, 500, 1500, "GET / (login)-3"], "isController": false}, {"data": [1.0, 500, 1500, "GET / (login)"], "isController": false}, {"data": [1.0, 500, 1500, "04 Cart"], "isController": true}, {"data": [1.0, 500, 1500, "GET /inventory-item.html"], "isController": false}, {"data": [1.0, 500, 1500, "GET /inventory.html"], "isController": false}, {"data": [1.0, 500, 1500, "GET /inventory.html-3"], "isController": false}, {"data": [1.0, 500, 1500, "GET /inventory.html-0"], "isController": false}, {"data": [1.0, 500, 1500, "01 Login"], "isController": true}, {"data": [1.0, 500, 1500, "GET /inventory.html-2"], "isController": false}, {"data": [1.0, 500, 1500, "GET /inventory.html-1"], "isController": false}, {"data": [1.0, 500, 1500, "GET /checkout-step-one.html"], "isController": false}, {"data": [1.0, 500, 1500, "GET /checkout-step-one.html-3"], "isController": false}, {"data": [1.0, 500, 1500, "GET /cart.html-3"], "isController": false}, {"data": [1.0, 500, 1500, "02 Inventory (product search)"], "isController": true}, {"data": [1.0, 500, 1500, "GET /cart.html-2"], "isController": false}, {"data": [1.0, 500, 1500, "GET /cart.html-1"], "isController": false}, {"data": [1.0, 500, 1500, "GET /cart.html-0"], "isController": false}, {"data": [1.0, 500, 1500, "GET /checkout-step-one.html-0"], "isController": false}, {"data": [1.0, 500, 1500, "GET /cart.html"], "isController": false}, {"data": [1.0, 500, 1500, "GET /checkout-step-one.html-2"], "isController": false}, {"data": [1.0, 500, 1500, "GET /checkout-step-one.html-1"], "isController": false}]}, function(index, item){
        switch(index){
            case 0:
                item = item.toFixed(3);
                break;
            case 1:
            case 2:
                item = formatDuration(item);
                break;
        }
        return item;
    }, [[0, 0]], 3);

    // Create statistics table
    createTable($("#statisticsTable"), {"supportsControllersDiscrimination": true, "overall": {"data": ["Total", 1250, 0, 0.0, 19.341599999999982, 3, 119, 15.0, 40.0, 48.0, 71.49000000000001, 74.0433597914939, 16558.235565247007, 17.261358251392014], "isController": false}, "titles": ["Label", "#Samples", "FAIL", "Error %", "Average", "Min", "Max", "Median", "90th pct", "95th pct", "99th pct", "Transactions/s", "Received", "Sent"], "items": [{"data": ["GET /inventory-item.html-0", 50, 0, 0.0, 8.700000000000001, 3, 31, 7.0, 16.699999999999996, 19.799999999999983, 31.0, 4.796623177283192, 7.588407760936302, 0.7026303482348427], "isController": false}, {"data": ["GET /inventory-item.html-3", 50, 0, 0.0, 12.920000000000002, 5, 40, 10.5, 22.0, 26.89999999999999, 40.0, 4.779200917606577, 132.67416453593958, 0.7280813897916268], "isController": false}, {"data": ["05 Checkout Step One", 50, 0, 0.0, 35.14000000000001, 13, 82, 33.0, 55.0, 73.59999999999997, 82.0, 4.707211447938241, 2631.6713689747694, 2.7857130248540765], "isController": true}, {"data": ["GET /inventory-item.html-1", 50, 0, 0.0, 12.020000000000001, 4, 39, 10.0, 21.0, 25.24999999999998, 39.0, 4.7796577765032024, 71.53149943839021, 0.66280410572603], "isController": false}, {"data": ["GET /inventory-item.html-2", 50, 0, 0.0, 24.5, 10, 52, 22.0, 39.9, 44.24999999999998, 52.0, 4.774637127578304, 2457.809739662911, 0.7227233933346066], "isController": false}, {"data": ["GET / (login)-0", 50, 0, 0.0, 10.460000000000003, 3, 28, 8.0, 25.499999999999993, 27.449999999999996, 28.0, 4.841677156967173, 7.659684564733223, 0.619394245666699], "isController": false}, {"data": ["GET / (login)-1", 50, 0, 0.0, 12.980000000000004, 4, 31, 11.0, 23.0, 26.699999999999974, 31.0, 4.881859011911736, 73.06102476322984, 0.6769765426674477], "isController": false}, {"data": ["GET / (login)-2", 50, 0, 0.0, 25.820000000000007, 8, 62, 22.5, 52.899999999999984, 58.449999999999996, 62.0, 4.871395167575994, 2507.6172636155497, 0.7373693857170694], "isController": false}, {"data": ["03 Inventory Item (product details)", 50, 0, 0.0, 34.86000000000001, 14, 83, 33.0, 51.0, 61.449999999999996, 83.0, 5.0720227226617975, 2835.627234860012, 2.986747755629945], "isController": true}, {"data": ["GET / (login)-3", 50, 0, 0.0, 13.200000000000001, 4, 48, 11.5, 24.0, 28.699999999999974, 48.0, 4.880905896134323, 135.49757022403358, 0.7435755076142132], "isController": false}, {"data": ["GET / (login)", 50, 0, 0.0, 39.83999999999999, 14, 119, 35.5, 80.1, 89.44999999999999, 119.0, 4.825323296660876, 2697.70442783729, 2.751942192626906], "isController": false}, {"data": ["04 Cart", 50, 0, 0.0, 36.359999999999985, 12, 88, 34.0, 58.8, 71.69999999999997, 88.0, 4.762358319839985, 2662.5024555910086, 2.75788914420421], "isController": true}, {"data": ["GET /inventory-item.html", 50, 0, 0.0, 34.86000000000001, 14, 83, 33.0, 51.0, 61.449999999999996, 83.0, 4.772814051164567, 2668.347964991409, 2.810553586769759], "isController": false}, {"data": ["GET /inventory.html", 50, 0, 0.0, 35.49999999999999, 15, 74, 35.5, 49.9, 60.449999999999996, 74.0, 5.069965524234435, 2834.4771122743864, 2.960780647941594], "isController": false}, {"data": ["GET /inventory.html-3", 50, 0, 0.0, 13.86, 3, 55, 12.5, 22.9, 30.499999999999957, 55.0, 5.077688636132833, 140.96040513608207, 0.7735541281608612], "isController": false}, {"data": ["GET /inventory.html-0", 50, 0, 0.0, 9.280000000000003, 3, 34, 8.0, 16.0, 24.0, 34.0, 5.0864699898270604, 8.04695447609359, 0.7202520981688708], "isController": false}, {"data": ["01 Login", 50, 0, 0.0, 39.83999999999999, 14, 119, 35.5, 80.1, 89.44999999999999, 119.0, 5.087505087505088, 2844.2829956501832, 2.9014677452177455], "isController": true}, {"data": ["GET /inventory.html-2", 50, 0, 0.0, 24.26, 9, 58, 22.5, 35.8, 47.89999999999999, 58.0, 5.073051948051948, 2611.4228483918428, 0.7678936054180195], "isController": false}, {"data": ["GET /inventory.html-1", 50, 0, 0.0, 12.56, 3, 53, 11.0, 21.799999999999997, 31.649999999999928, 53.0, 5.077688636132833, 75.99177573118716, 0.7041326038387327], "isController": false}, {"data": ["GET /checkout-step-one.html", 50, 0, 0.0, 35.14000000000001, 13, 82, 33.0, 55.0, 73.59999999999997, 82.0, 4.847779716889665, 2710.259189572426, 2.8689008871436883], "isController": false}, {"data": ["GET /checkout-step-one.html-3", 50, 0, 0.0, 11.920000000000003, 4, 27, 10.0, 19.0, 24.349999999999987, 27.0, 4.855311711011847, 134.78705664934938, 0.739676393474461], "isController": false}, {"data": ["GET /cart.html-3", 50, 0, 0.0, 14.42, 3, 44, 12.5, 27.9, 36.34999999999999, 44.0, 4.704996706502306, 130.6142005622471, 0.7167768420062105], "isController": false}, {"data": ["02 Inventory (product search)", 50, 0, 0.0, 35.49999999999999, 15, 74, 35.5, 49.9, 60.449999999999996, 74.0, 4.977105315548477, 2782.561545017918, 2.9065517370097553], "isController": true}, {"data": ["GET /cart.html-2", 50, 0, 0.0, 25.14, 8, 61, 23.0, 43.699999999999996, 54.04999999999996, 61.0, 4.6988065031482, 2418.7748889906966, 0.711245124988253], "isController": false}, {"data": ["GET /cart.html-1", 50, 0, 0.0, 13.560000000000002, 3, 40, 11.5, 24.9, 30.24999999999998, 40.0, 4.707654646455136, 70.45391353215328, 0.6528192966763958], "isController": false}, {"data": ["GET /cart.html-0", 50, 0, 0.0, 9.76, 3, 31, 7.5, 21.699999999999996, 23.449999999999996, 31.0, 4.7010154193305755, 7.437153300112825, 0.6427169518616022], "isController": false}, {"data": ["GET /checkout-step-one.html-0", 50, 0, 0.0, 8.539999999999997, 3, 53, 7.0, 12.0, 18.349999999999987, 53.0, 4.8666536889234955, 7.69919821880475, 0.7271464984426709], "isController": false}, {"data": ["GET /cart.html", 50, 0, 0.0, 36.359999999999985, 12, 88, 34.0, 58.8, 71.69999999999997, 88.0, 4.687792987061692, 2620.815046057566, 2.7147082434839676], "isController": false}, {"data": ["GET /checkout-step-one.html-2", 50, 0, 0.0, 25.320000000000004, 9, 66, 23.5, 44.699999999999996, 53.449999999999996, 66.0, 4.8501309535357455, 2496.6712187166554, 0.734150681443399], "isController": false}, {"data": ["GET /checkout-step-one.html-1", 50, 0, 0.0, 12.619999999999997, 4, 37, 10.0, 26.699999999999996, 31.349999999999987, 37.0, 4.860976083997667, 72.74849461646899, 0.6740806678981139], "isController": false}]}, function(index, item){
        switch(index){
            // Errors pct
            case 3:
                item = item.toFixed(2) + '%';
                break;
            // Mean
            case 4:
            // Mean
            case 7:
            // Median
            case 8:
            // Percentile 1
            case 9:
            // Percentile 2
            case 10:
            // Percentile 3
            case 11:
            // Throughput
            case 12:
            // Kbytes/s
            case 13:
            // Sent Kbytes/s
                item = item.toFixed(2);
                break;
        }
        return item;
    }, [[0, 0]], 0, summaryTableHeader);

    // Create error table
    createTable($("#errorsTable"), {"supportsControllersDiscrimination": false, "titles": ["Type of error", "Number of errors", "% in errors", "% in all samples"], "items": []}, function(index, item){
        switch(index){
            case 2:
            case 3:
                item = item.toFixed(2) + '%';
                break;
        }
        return item;
    }, [[1, 1]]);

        // Create top5 errors by sampler
    createTable($("#top5ErrorsBySamplerTable"), {"supportsControllersDiscrimination": false, "overall": {"data": ["Total", 1250, 0, "", "", "", "", "", "", "", "", "", ""], "isController": false}, "titles": ["Sample", "#Samples", "#Errors", "Error", "#Errors", "Error", "#Errors", "Error", "#Errors", "Error", "#Errors", "Error", "#Errors"], "items": [{"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}]}, function(index, item){
        return item;
    }, [[0, 0]], 0);

});
