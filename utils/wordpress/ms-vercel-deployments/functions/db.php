<?php 

function get_updated_posts() {
    global $wpdb, $ms_plugin_db_name;
    return $wpdb->get_results(
        $wpdb->prepare("SELECT * FROM ".$wpdb->prefix.$ms_plugin_db_name)
    );
}

function clean_updated_posts() {
    global $wpdb, $ms_plugin_db_name;
    return $wpdb->query("TRUNCATE TABLE ".$wpdb->prefix.$ms_plugin_db_name);
}