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

    var data = {"OkPercent": 91.6237384859917, "KoPercent": 8.376261514008311};
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
    createTable($("#apdexTable"), {"supportsControllersDiscrimination": true, "overall": {"data": [0.3598109113453193, 500, 1500, "Total"], "isController": false}, "titles": ["Apdex", "T (Toleration threshold)", "F (Frustration threshold)", "Label"], "items": [{"data": [0.5749625187406296, 500, 1500, "GET /inventory-item.html-0"], "isController": false}, {"data": [0.5354822588705647, 500, 1500, "GET /inventory-item.html-3"], "isController": false}, {"data": [0.12438118811881188, 500, 1500, "05 Checkout Step One"], "isController": true}, {"data": [0.5362318840579711, 500, 1500, "GET /inventory-item.html-1"], "isController": false}, {"data": [0.3423288355822089, 500, 1500, "GET /inventory-item.html-2"], "isController": false}, {"data": [0.5797172111165285, 500, 1500, "GET / (login)-0"], "isController": false}, {"data": [0.538517796196977, 500, 1500, "GET / (login)-1"], "isController": false}, {"data": [0.3508044856167723, 500, 1500, "GET / (login)-2"], "isController": false}, {"data": [0.14981949458483754, 500, 1500, "03 Inventory Item (product details)"], "isController": true}, {"data": [0.5360799609946367, 500, 1500, "GET / (login)-3"], "isController": false}, {"data": [0.15247524752475247, 500, 1500, "GET / (login)"], "isController": false}, {"data": [0.14685598377281947, 500, 1500, "04 Cart"], "isController": true}, {"data": [0.14352226720647773, 500, 1500, "GET /inventory-item.html"], "isController": false}, {"data": [0.14654138344662135, 500, 1500, "GET /inventory.html"], "isController": false}, {"data": [0.5378486055776892, 500, 1500, "GET /inventory.html-3"], "isController": false}, {"data": [0.5699701195219123, 500, 1500, "GET /inventory.html-0"], "isController": false}, {"data": [0.15948275862068967, 500, 1500, "01 Login"], "isController": true}, {"data": [0.34760956175298807, 500, 1500, "GET /inventory.html-2"], "isController": false}, {"data": [0.5448207171314741, 500, 1500, "GET /inventory.html-1"], "isController": false}, {"data": [0.12199170124481327, 500, 1500, "GET /checkout-step-one.html"], "isController": false}, {"data": [0.5201967892283791, 500, 1500, "GET /checkout-step-one.html-3"], "isController": false}, {"data": [0.5368177136972193, 500, 1500, "GET /cart.html-3"], "isController": false}, {"data": [0.14958283671036948, 500, 1500, "02 Inventory (product search)"], "isController": true}, {"data": [0.33419155509783727, 500, 1500, "GET /cart.html-2"], "isController": false}, {"data": [0.5424819773429455, 500, 1500, "GET /cart.html-1"], "isController": false}, {"data": [0.5576725025746653, 500, 1500, "GET /cart.html-0"], "isController": false}, {"data": [0.5629207664422579, 500, 1500, "GET /checkout-step-one.html-0"], "isController": false}, {"data": [0.1369806663924311, 500, 1500, "GET /cart.html"], "isController": false}, {"data": [0.32755049197307096, 500, 1500, "GET /checkout-step-one.html-2"], "isController": false}, {"data": [0.518125323666494, 500, 1500, "GET /checkout-step-one.html-1"], "isController": false}]}, function(index, item){
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
    createTable($("#statisticsTable"), {"supportsControllersDiscrimination": true, "overall": {"data": ["Total", 52219, 4374, 8.376261514008311, 1283.0363277734202, 0, 10637, 779.0, 2463.9000000000015, 3218.0, 4789.970000000005, 174.57075232007702, 35442.894269839126, 37.349800398993075], "isController": false}, "titles": ["Label", "#Samples", "FAIL", "Error %", "Average", "Min", "Max", "Median", "90th pct", "95th pct", "99th pct", "Transactions/s", "Received", "Sent"], "items": [{"data": ["GET /inventory-item.html-0", 2001, 0, 0.0, 967.3123438280853, 3, 8270, 778.0, 1971.1999999999998, 2448.7999999999997, 4234.860000000001, 6.764705882352941, 10.701976102941176, 0.990923713235294], "isController": false}, {"data": ["GET /inventory-item.html-3", 2001, 101, 5.047476261869066, 945.61869065467, 4, 8378, 737.0, 1960.3999999999999, 2653.499999999999, 4453.980000000001, 6.762922555918317, 179.09815236347416, 0.9782853912761341], "isController": false}, {"data": ["05 Checkout Step One", 2424, 583, 24.051155115511552, 1976.6410891089147, 0, 10229, 1838.5, 4113.0, 5101.0, 8755.0, 8.237137119108867, 3498.1362293222032, 3.7414492499838587], "isController": true}, {"data": ["GET /inventory-item.html-1", 2001, 103, 5.147426286856572, 943.0789605197385, 4, 8151, 728.0, 1970.8, 2614.199999999999, 4319.600000000001, 6.763311149492498, 96.8555744399397, 0.8896043032031934], "isController": false}, {"data": ["GET /inventory-item.html-2", 2001, 102, 5.097451274362818, 1420.6606696651647, 3, 8725, 1273.0, 2660.7999999999997, 3255.7, 5908.080000000001, 6.75972407083353, 3303.1249432572517, 0.9710432779847848], "isController": false}, {"data": ["GET / (login)-0", 2051, 0, 0.0, 974.9361287177, 3, 8199, 801.0, 2030.3999999999999, 2616.3999999999987, 4371.16, 6.865961435457954, 10.86216555218934, 0.8783603008251873], "isController": false}, {"data": ["GET / (login)-1", 2051, 108, 5.2657240370550955, 940.7537786445633, 3, 8277, 671.0, 2050.8, 2548.199999999996, 4478.76, 6.86327328945211, 98.18535520095404, 0.9016268170440742], "isController": false}, {"data": ["GET / (login)-2", 2051, 107, 5.216967333008289, 1424.7674305216972, 3, 8870, 1201.0, 2723.5999999999995, 3511.999999999998, 6008.52, 6.859784139215823, 3347.8187246228126, 0.9841760482827128], "isController": false}, {"data": ["03 Inventory Item (product details)", 2493, 580, 23.265142398716407, 1929.2454873646207, 0, 10393, 1755.0, 3977.1999999999994, 5010.499999999993, 8708.159999999996, 8.384397554298475, 3577.351541795448, 3.8111975838523833], "isController": true}, {"data": ["GET / (login)-3", 2051, 107, 5.216967333008289, 944.7215992198952, 3, 8304, 676.0, 2079.3999999999996, 2588.7999999999997, 4431.000000000002, 6.863365157127894, 181.46348409897834, 0.9910426559315737], "isController": false}, {"data": ["GET / (login)", 2525, 594, 23.524752475247524, 1958.1984158415883, 2, 10637, 1671.0, 4135.0, 5847.5999999999985, 9212.11999999997, 8.441795076678245, 3640.4078268552303, 3.751959347950733], "isController": false}, {"data": ["04 Cart", 2465, 572, 23.204868154158216, 1926.9553752535498, 0, 10344, 1791.0, 3983.4, 4986.299999999991, 7902.90000000002, 8.327393238764776, 3528.9198633032215, 3.6871089408417252], "isController": true}, {"data": ["GET /inventory-item.html", 2470, 580, 23.481781376518217, 1943.9902834008087, 2, 10393, 1770.5, 4002.700000000001, 5037.899999999996, 8727.939999999997, 8.343889874166033, 3593.2186563107, 3.828101907566929], "isController": false}, {"data": ["GET /inventory.html", 2501, 605, 24.19032387045182, 1927.2518992403043, 2, 10465, 1682.0, 4029.4000000000005, 5431.300000000005, 8438.62, 8.41059580378191, 3588.6718408456163, 3.7929395480019372], "isController": false}, {"data": ["GET /inventory.html-3", 2008, 105, 5.229083665338646, 938.580179282867, 3, 8295, 714.0, 1975.0, 2498.3499999999995, 4040.610000000006, 6.756620343887748, 178.62047756170296, 0.9755044121605707], "isController": false}, {"data": ["GET /inventory.html-0", 2008, 0, 0.0, 978.0831673306767, 3, 7853, 792.5, 2049.1000000000004, 2665.55, 4203.740000000002, 6.760692364929246, 10.695626592954468, 0.9573246024558012], "isController": false}, {"data": ["01 Login", 2552, 594, 23.275862068965516, 1942.3150470219468, 0, 10637, 1663.5, 4118.9000000000015, 5836.15, 9174.859999999971, 8.488585978532392, 3621.856990833483, 3.7328400662838153], "isController": true}, {"data": ["GET /inventory.html-2", 2008, 103, 5.129482071713148, 1407.529382470121, 3, 8815, 1233.5, 2644.800000000001, 3292.7999999999993, 5854.1100000000015, 6.752984698167143, 3298.7235751744574, 0.9697477457121236], "isController": false}, {"data": ["GET /inventory.html-1", 2008, 95, 4.731075697211155, 930.1334661354557, 3, 8340, 718.5, 1962.6000000000008, 2527.8499999999995, 3964.370000000001, 6.7567112851884, 97.11361122011974, 0.8926372604194007], "isController": false}, {"data": ["GET /checkout-step-one.html", 2410, 583, 24.190871369294605, 1983.0323651452313, 2, 10229, 1842.0, 4113.9, 5117.749999999994, 8766.19999999999, 8.22334748249553, 3512.5671692448514, 3.7568839345732052], "isController": false}, {"data": ["GET /checkout-step-one.html-3", 1931, 96, 4.971517348524081, 970.7674779906794, 3, 8072, 763.0, 1987.0, 2587.0, 4017.1600000000103, 6.59273876912782, 174.71811659370326, 0.9544304886001269], "isController": false}, {"data": ["GET /cart.html-3", 1942, 74, 3.810504634397528, 962.7826982492284, 3, 8149, 769.0, 1929.7, 2524.7999999999993, 3945.199999999996, 6.59913484050958, 176.82810763776797, 0.9670285373503555], "isController": false}, {"data": ["02 Inventory (product search)", 2517, 605, 24.036551450139054, 1919.9455701231623, 0, 10465, 1682.0, 4019.0000000000027, 5393.699999999995, 8427.58000000001, 8.430692140732603, 3574.379754981963, 3.7778339545958493], "isController": true}, {"data": ["GET /cart.html-2", 1942, 77, 3.964984552008239, 1433.974768280121, 4, 8680, 1287.0, 2581.1000000000004, 3200.5499999999997, 5702.529999999998, 6.596915551328215, 3261.843993361047, 0.9589639401029282], "isController": false}, {"data": ["GET /cart.html-1", 1942, 74, 3.810504634397528, 956.4572605561265, 3, 8156, 759.5, 1954.4, 2500.7, 4099.919999999996, 6.598933025247205, 95.60718434622311, 0.8802170053348737], "isController": false}, {"data": ["GET /cart.html-0", 1942, 0, 0.0, 993.6915550978381, 3, 8168, 818.0, 2049.4, 2573.8999999999987, 4009.369999999997, 6.600929296637333, 10.44287642632078, 0.9024708022746353], "isController": false}, {"data": ["GET /checkout-step-one.html-0", 1931, 0, 0.0, 988.6038322112892, 4, 7650, 806.0, 2010.1999999999998, 2542.999999999999, 3998.2000000000107, 6.59787473946766, 10.438044021423446, 0.9858152686899921], "isController": false}, {"data": ["GET /cart.html", 2431, 572, 23.529411764705884, 1949.6013986013988, 2, 10344, 1811.0, 4006.6000000000013, 5021.000000000001, 7948.799999999977, 8.257276491387774, 3548.1462657350203, 3.707197195336728], "isController": false}, {"data": ["GET /checkout-step-one.html-2", 1931, 93, 4.816157431382703, 1476.566545831175, 3, 8249, 1287.0, 2800.6, 3363.3999999999996, 5958.520000000006, 6.589026932775546, 3229.2099416337105, 0.9493279282099754], "isController": false}, {"data": ["GET /checkout-step-one.html-1", 1931, 94, 4.867944070429829, 970.9285344381173, 3, 8062, 750.0, 2015.1999999999996, 2589.7999999999997, 3907.36, 6.592648735754621, 94.64247334112605, 0.8697114883988502], "isController": false}]}, function(index, item){
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
    createTable($("#errorsTable"), {"supportsControllersDiscrimination": false, "titles": ["Type of error", "Number of errors", "% in errors", "% in all samples"], "items": [{"data": ["Non HTTP response code: java.net.BindException/Non HTTP response message: Address already in use: getsockopt", 3843, 87.86008230452676, 7.359390260250101], "isController": false}, {"data": ["Assertion failed", 531, 12.139917695473251, 1.0168712537582105], "isController": false}]}, function(index, item){
        switch(index){
            case 2:
            case 3:
                item = item.toFixed(2) + '%';
                break;
        }
        return item;
    }, [[1, 1]]);

        // Create top5 errors by sampler
    createTable($("#top5ErrorsBySamplerTable"), {"supportsControllersDiscrimination": false, "overall": {"data": ["Total", 52219, 4374, "Non HTTP response code: java.net.BindException/Non HTTP response message: Address already in use: getsockopt", 3843, "Assertion failed", 531, "", "", "", "", "", ""], "isController": false}, "titles": ["Sample", "#Samples", "#Errors", "Error", "#Errors", "Error", "#Errors", "Error", "#Errors", "Error", "#Errors", "Error", "#Errors"], "items": [{"data": [], "isController": false}, {"data": ["GET /inventory-item.html-3", 2001, 101, "Non HTTP response code: java.net.BindException/Non HTTP response message: Address already in use: getsockopt", 101, "", "", "", "", "", "", "", ""], "isController": false}, {"data": [], "isController": false}, {"data": ["GET /inventory-item.html-1", 2001, 103, "Non HTTP response code: java.net.BindException/Non HTTP response message: Address already in use: getsockopt", 103, "", "", "", "", "", "", "", ""], "isController": false}, {"data": ["GET /inventory-item.html-2", 2001, 102, "Non HTTP response code: java.net.BindException/Non HTTP response message: Address already in use: getsockopt", 102, "", "", "", "", "", "", "", ""], "isController": false}, {"data": [], "isController": false}, {"data": ["GET / (login)-1", 2051, 108, "Non HTTP response code: java.net.BindException/Non HTTP response message: Address already in use: getsockopt", 108, "", "", "", "", "", "", "", ""], "isController": false}, {"data": ["GET / (login)-2", 2051, 107, "Non HTTP response code: java.net.BindException/Non HTTP response message: Address already in use: getsockopt", 107, "", "", "", "", "", "", "", ""], "isController": false}, {"data": [], "isController": false}, {"data": ["GET / (login)-3", 2051, 107, "Non HTTP response code: java.net.BindException/Non HTTP response message: Address already in use: getsockopt", 107, "", "", "", "", "", "", "", ""], "isController": false}, {"data": ["GET / (login)", 2525, 594, "Non HTTP response code: java.net.BindException/Non HTTP response message: Address already in use: getsockopt", 474, "Assertion failed", 120, "", "", "", "", "", ""], "isController": false}, {"data": [], "isController": false}, {"data": ["GET /inventory-item.html", 2470, 580, "Non HTTP response code: java.net.BindException/Non HTTP response message: Address already in use: getsockopt", 469, "Assertion failed", 111, "", "", "", "", "", ""], "isController": false}, {"data": ["GET /inventory.html", 2501, 605, "Non HTTP response code: java.net.BindException/Non HTTP response message: Address already in use: getsockopt", 493, "Assertion failed", 112, "", "", "", "", "", ""], "isController": false}, {"data": ["GET /inventory.html-3", 2008, 105, "Non HTTP response code: java.net.BindException/Non HTTP response message: Address already in use: getsockopt", 105, "", "", "", "", "", "", "", ""], "isController": false}, {"data": [], "isController": false}, {"data": ["01 Login", 35, 1, "Assertion failed", 1, "", "", "", "", "", "", "", ""], "isController": false}, {"data": ["GET /inventory.html-2", 2008, 103, "Non HTTP response code: java.net.BindException/Non HTTP response message: Address already in use: getsockopt", 103, "", "", "", "", "", "", "", ""], "isController": false}, {"data": ["GET /inventory.html-1", 2008, 95, "Non HTTP response code: java.net.BindException/Non HTTP response message: Address already in use: getsockopt", 95, "", "", "", "", "", "", "", ""], "isController": false}, {"data": ["GET /checkout-step-one.html", 2410, 583, "Non HTTP response code: java.net.BindException/Non HTTP response message: Address already in use: getsockopt", 479, "Assertion failed", 104, "", "", "", "", "", ""], "isController": false}, {"data": ["GET /checkout-step-one.html-3", 1931, 96, "Non HTTP response code: java.net.BindException/Non HTTP response message: Address already in use: getsockopt", 96, "", "", "", "", "", "", "", ""], "isController": false}, {"data": ["GET /cart.html-3", 1942, 74, "Non HTTP response code: java.net.BindException/Non HTTP response message: Address already in use: getsockopt", 74, "", "", "", "", "", "", "", ""], "isController": false}, {"data": [], "isController": false}, {"data": ["GET /cart.html-2", 1942, 77, "Non HTTP response code: java.net.BindException/Non HTTP response message: Address already in use: getsockopt", 77, "", "", "", "", "", "", "", ""], "isController": false}, {"data": ["GET /cart.html-1", 1942, 74, "Non HTTP response code: java.net.BindException/Non HTTP response message: Address already in use: getsockopt", 74, "", "", "", "", "", "", "", ""], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": ["GET /cart.html", 2431, 572, "Non HTTP response code: java.net.BindException/Non HTTP response message: Address already in use: getsockopt", 489, "Assertion failed", 83, "", "", "", "", "", ""], "isController": false}, {"data": ["GET /checkout-step-one.html-2", 1931, 93, "Non HTTP response code: java.net.BindException/Non HTTP response message: Address already in use: getsockopt", 93, "", "", "", "", "", "", "", ""], "isController": false}, {"data": ["GET /checkout-step-one.html-1", 1931, 94, "Non HTTP response code: java.net.BindException/Non HTTP response message: Address already in use: getsockopt", 94, "", "", "", "", "", "", "", ""], "isController": false}]}, function(index, item){
        return item;
    }, [[0, 0]], 0);

});
