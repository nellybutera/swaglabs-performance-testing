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

    var data = {"OkPercent": 55.55555555555556, "KoPercent": 44.44444444444444};
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
    createTable($("#apdexTable"), {"supportsControllersDiscrimination": true, "overall": {"data": [0.14285714285714285, 500, 1500, "Total"], "isController": false}, "titles": ["Apdex", "T (Toleration threshold)", "F (Frustration threshold)", "Label"], "items": [{"data": [0.0, 500, 1500, "GET /inventory.html"], "isController": false}, {"data": [0.0, 500, 1500, "05 Checkout Step One"], "isController": true}, {"data": [0.0, 500, 1500, "01 Login"], "isController": true}, {"data": [0.5, 500, 1500, "GET / (login)-0"], "isController": false}, {"data": [0.0, 500, 1500, "GET /checkout-step-one.html"], "isController": false}, {"data": [0.5, 500, 1500, "GET / (login)-1"], "isController": false}, {"data": [0.5, 500, 1500, "GET / (login)-2"], "isController": false}, {"data": [0.0, 500, 1500, "03 Inventory Item (product details)"], "isController": true}, {"data": [0.5, 500, 1500, "GET / (login)-3"], "isController": false}, {"data": [0.0, 500, 1500, "GET / (login)"], "isController": false}, {"data": [0.0, 500, 1500, "04 Cart"], "isController": true}, {"data": [0.0, 500, 1500, "02 Inventory (product search)"], "isController": true}, {"data": [0.0, 500, 1500, "GET /inventory-item.html"], "isController": false}, {"data": [0.0, 500, 1500, "GET /cart.html"], "isController": false}]}, function(index, item){
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
    createTable($("#statisticsTable"), {"supportsControllersDiscrimination": true, "overall": {"data": ["Total", 45, 20, 44.44444444444444, 860.6222222222219, 544, 2460, 573.0, 1841.1999999999998, 2298.499999999999, 2460.0, 9.14820085383208, 1155.9295747357187, 1.7788168326895712], "isController": false}, "titles": ["Label", "#Samples", "FAIL", "Error %", "Average", "Min", "Max", "Median", "90th pct", "95th pct", "99th pct", "Transactions/s", "Received", "Sent"], "items": [{"data": ["GET /inventory.html", 5, 5, 100.0, 572.8, 572, 574, 573.0, 574.0, 574.0, 574.0, 8.695652173913043, 33.82472826086957, 1.2567934782608696], "isController": false}, {"data": ["05 Checkout Step One", 5, 5, 100.0, 549.0, 544, 552, 551.0, 552.0, 552.0, 552.0, 9.025270758122744, 35.291981611010826, 1.3749435920577615], "isController": true}, {"data": ["01 Login", 5, 0, 0.0, 2139.6, 1760, 2460, 2155.0, 2460.0, 2460.0, 2460.0, 1.9584802193497848, 1098.318767136702, 1.1398966901684293], "isController": true}, {"data": ["GET / (login)-0", 5, 0, 0.0, 975.6, 598, 1297, 996.0, 1297.0, 1297.0, 1297.0, 3.855050115651504, 7.624265131071704, 0.5044694487278335], "isController": false}, {"data": ["GET /checkout-step-one.html", 5, 5, 100.0, 549.0, 544, 552, 551.0, 552.0, 552.0, 552.0, 9.025270758122744, 35.291981611010826, 1.3749435920577615], "isController": false}, {"data": ["GET / (login)-1", 5, 0, 0.0, 558.0, 546, 568, 557.0, 568.0, 568.0, 568.0, 8.665511265164644, 133.40317645147314, 1.2270499350086657], "isController": false}, {"data": ["GET / (login)-2", 5, 0, 0.0, 1039.2, 1026, 1055, 1036.0, 1055.0, 1055.0, 1055.0, 4.725897920604915, 2434.858296904537, 0.7291912807183365], "isController": false}, {"data": ["03 Inventory Item (product details)", 5, 5, 100.0, 567.4, 565, 569, 568.0, 569.0, 569.0, 569.0, 8.787346221441126, 34.36161302724078, 1.3129530975395431], "isController": true}, {"data": ["GET / (login)-3", 5, 0, 0.0, 790.8, 783, 798, 794.0, 798.0, 798.0, 798.0, 6.265664160401002, 176.77372141290726, 0.972891212406015], "isController": false}, {"data": ["GET / (login)", 5, 0, 0.0, 2139.6, 1760, 2460, 2155.0, 2460.0, 2460.0, 2460.0, 2.026753141467369, 1136.6063285366843, 1.1796336643696796], "isController": false}, {"data": ["04 Cart", 5, 5, 100.0, 553.2, 549, 556, 553.0, 556.0, 556.0, 556.0, 8.992805755395683, 34.98060926258992, 1.2558312724820142], "isController": true}, {"data": ["02 Inventory (product search)", 5, 5, 100.0, 572.8, 572, 574, 573.0, 574.0, 574.0, 574.0, 8.695652173913043, 33.82472826086957, 1.2567934782608696], "isController": true}, {"data": ["GET /inventory-item.html", 5, 5, 100.0, 567.4, 565, 569, 568.0, 569.0, 569.0, 569.0, 8.787346221441126, 34.36161302724078, 1.3129530975395431], "isController": false}, {"data": ["GET /cart.html", 5, 5, 100.0, 553.2, 549, 556, 553.0, 556.0, 556.0, 556.0, 8.992805755395683, 34.98060926258992, 1.2558312724820142], "isController": false}]}, function(index, item){
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
    createTable($("#errorsTable"), {"supportsControllersDiscrimination": false, "titles": ["Type of error", "Number of errors", "% in errors", "% in all samples"], "items": [{"data": ["404/Not Found", 20, 100.0, 44.44444444444444], "isController": false}]}, function(index, item){
        switch(index){
            case 2:
            case 3:
                item = item.toFixed(2) + '%';
                break;
        }
        return item;
    }, [[1, 1]]);

        // Create top5 errors by sampler
    createTable($("#top5ErrorsBySamplerTable"), {"supportsControllersDiscrimination": false, "overall": {"data": ["Total", 45, 20, "404/Not Found", 20, "", "", "", "", "", "", "", ""], "isController": false}, "titles": ["Sample", "#Samples", "#Errors", "Error", "#Errors", "Error", "#Errors", "Error", "#Errors", "Error", "#Errors", "Error", "#Errors"], "items": [{"data": ["GET /inventory.html", 5, 5, "404/Not Found", 5, "", "", "", "", "", "", "", ""], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": ["GET /checkout-step-one.html", 5, 5, "404/Not Found", 5, "", "", "", "", "", "", "", ""], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": ["GET /inventory-item.html", 5, 5, "404/Not Found", 5, "", "", "", "", "", "", "", ""], "isController": false}, {"data": ["GET /cart.html", 5, 5, "404/Not Found", 5, "", "", "", "", "", "", "", ""], "isController": false}]}, function(index, item){
        return item;
    }, [[0, 0]], 0);

});
