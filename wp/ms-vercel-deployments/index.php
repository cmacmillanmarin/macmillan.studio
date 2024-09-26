<?php
/*
* Plugin Name: Vercel Deployments
* Description: Deploy your application through Vercel. Get Deployment status. Get updated content.
* Version: 1.0
* Author: MacMillan Studio
* Plugin URI: https://macmillan.studio
*/

$ms_plugin_name = 'Vercel Deployments';
$ms_plugin_db_name = 'vercel_deployments';

$ms_vercel_base_url = 'https://api.vercel.com';
$ms_vercel_api_token = 'TThKBlnbEsZezNyAxHOi2199';
$ms_vercel_team_id = 'team_GOJdEbTtAc6vw6y83Fx7fXqA';
$ms_vercel_project_id = 'prj_zbiPr825iEErmF8fUEnYLtFCjIGQ';
$ms_vercel_deploy_hook = 'https://api.vercel.com/v1/integrations/deploy/prj_zbiPr825iEErmF8fUEnYLtFCjIGQ/A4muDnkS5w';

if ( ! defined('ABSPATH') ) {
    echo 'Unsupported!';
    die;
}

//
// 
function create_database() {
    global $wpdb, $ms_plugin_db_name;
    $deploy_details = $wpdb->prefix.$ms_plugin_db_name;
    $charset = $wpdb->get_charset_collate;

    $deploy_det = "CREATE TABLE ".$deploy_details."(
        post_id         int     NOT NULL,
        post_type       text,
        post_slug       text,
        PRIMARY KEY (post_id)
    ) $charset";

    require_once(ABSPATH.'wp-admin/includes/upgrade.php');

    dbDelta($deploy_det);
}

register_activation_hook(__FILE__, 'create_database');

//
//
function save_updated_post($post_id) {
    global $wpdb, $ms_plugin_db_name;
    $post = get_post($post_id);
    $wpdb->insert(
        $wpdb->prefix.$ms_plugin_db_name,
        [
            'post_id'       => get_the_id(),
            'post_type'     => get_post_type(),
            'post_slug'     => $post->post_name
        ]
        );
}

add_action('save_post', 'save_updated_post');

//
//
include('functions/db.php');
function add_rest_api_routes() {
    register_rest_route('vercel-deployments/v1', 'updated-posts', array(
        'methods' => WP_REST_SERVER::READABLE,
        'callback' => 'get_updated_posts'
    ));
    register_rest_route('vercel-deployments/v1', 'clean-updated-posts', array(
        'methods' => WP_REST_SERVER::READABLE,
        'callback' => 'clean_updated_posts'
    ));
}
add_action('rest_api_init', 'add_rest_api_routes');


//
// Dashboard Widget
function create_dashboard_widget() {
    wp_add_dashboard_widget(
        'vercel_deployments',
        'Vercel Deployments',
        'create_deployments_dashboard_widget'
    );
}

include('functions/deployments.php');
function create_deployments_dashboard_widget() {
    $data = get_deployments();

    if ($data === false) {
        echo "Error: Unable to fetch data.";
    } else {
        ?>
        <style lang="css">
            .vercel-deployments-list__item,
            .vercel-deployments-list__header {
                display: flex;
                padding-bottom: 5px;
                margin-bottom: 10px;
                border-bottom: 1px solid #8c8f94;
            }
            .vercel-deployments-list__header {
                padding-bottom: 2.5px;
            }
            .vercel-deployments-list__header__title,
            .vercel-deployments-list__header__status,
            .vercel-deployments-list__header__type {
                margin: 0;
            }
            .vercel-deployments-list__item__title,
            .vercel-deployments-list__item__status,
            .vercel-deployments-list__item__type {
                margin: 0.5px;
            }
            .vercel-deployments-list__item__title span,
            .vercel-deployments-list__item__status span,
            .vercel-deployments-list__item__type span {
                color: #646970;
            }
            .vercel-deployments-list__item__dot {
                width: 20px;
                padding-top: 6px;
                padding-left: 5px;
            }
            .vercel-deployments-list__item__dot__status {
                width: 8px;
                height: 8px;
                border-radius: 50%;
                background: #e00;
            }
            .vercel-deployments-list__item__status__loader {
                width: 10px;
            }
            .vercel-deployments-list__item__dot__status--ready {
                background: #50e3c2;
            }
            .vercel-deployments-list__item__dot__status--progress {
                background: #f5a623;
            }
            .vercel-deployments-list__item__dot__status--queued {
                background: #8c8f94;
            }

            .vercel-deployments-list__item__title,
            .vercel-deployments-list__header__title {
                width: calc(50% - 20px);
            }
            .vercel-deployments-list__item__status,
            .vercel-deployments-list__header__status {
                width: 25%;
            }
            .vercel-deployments-list__item__type,
            .vercel-deployments-list__header__type {
                width: 25%;
                text-align: right;
            }
            .vercel-deployments-list__button {
                margin-top: 10px !important;
            }
            .vercel-deployments-list__button--inactive {
                opacity: .5;
                pointer-events: none;
            }
        </style>
        <div id="vercel-deployments-list" class="vercel-deployments-list">
            <div class="vercel-deployments-list__header">
                <p class="vercel-deployments-list__header__title"><strong>Name</strong></p>
                <p class="vercel-deployments-list__header__status"><strong>Status</strong></p>
                <p class="vercel-deployments-list__header__type"><strong>Type</strong></p>
            </div>
        <?php
        $data = json_decode($data);
        $in_deployment = $data->deployments[0]->state === "BUILDING" || $data->deployments[0]->state === "QUEUED";
        for ($i = 0; $i < count($data->deployments); $i++) {
            $now = time();
            $deployment = $data->deployments[$i];
            $deployment_status = $deployment->state;
            $deployment_title = $deployment->meta->githubCommitMessage;
            $deployment_init_time = isset($deployment->buildingAt) ? $deployment->buildingAt : $deployment->createdAt;
            $deployment_time = ($deployment->ready - $deployment_init_time) / 1000;
            $deployment_time_in_min = floor($deployment_time / 60);
            $deployment_time_in_sec = $deployment_time % 60;
            $deployment_hook = !empty($deployment->meta->deployHookId);
            $deployment_date = floor(($now - ($deployment_init_time / 1000)) / 60);
            ?>
                <div class="vercel-deployments-list__item">
                    <div class="vercel-deployments-list__item__dot">
                        <div class="vercel-deployments-list__item__dot__status <?php echo ($deployment_status === "READY" ? "vercel-deployments-list__item__dot__status--ready" : ""); echo ($deployment_status === "BUILDING" ? "vercel-deployments-list__item__dot__status--progress" : ""); echo ($deployment_status === "QUEUED" ? "vercel-deployments-list__item__dot__status--queued" : ""); ?>"></div>
                    </div>
                    <p class="vercel-deployments-list__item__title">
                        <?php echo $deployment_title; ?><br />
                        <span>
                        <?php
                            $date_msg = $deployment_date."m";
                            if ($deployment_date >= 60) {
                                $deployment_date = floor($deployment_date / 60);
                                if ($deployment_date >= 24) {
                                    $deployment_date = floor($deployment_date / 24);
                                    $date_msg = $deployment_date."d";
                                } else {
                                    $date_msg = $deployment_date."h";
                                }
                            }
                            echo $date_msg." ago";
                        ?>
                        </span>
                    </p>
                    <p class="vercel-deployments-list__item__status">
                        <?php echo $deployment_status; ?><br />
                        <span>
                        <?php
                            if ($deployment_status !== "BUILDING" && $deployment_status !== "QUEUED") {
                                $min_msg = $deployment_time_in_min > 0 ? $deployment_time_in_min."m " : "";
                                echo $min_msg.$deployment_time_in_sec."s";
                            } else {
                                ?>
                                <img src="<?php echo plugin_dir_url( __FILE__ ); ?>/loading.gif" class="vercel-deployments-list__item__status__loader" />
                                <?php
                            }
                        ?>
                        </span>
                    </p>
                    <p class="vercel-deployments-list__item__type">
                        <?php
                            $msg = $deployment_hook ? "Data update" : "New Release";
                            echo $msg;
                        ?>
                    </p>
                </div>
            <?php
        }
        ?>
            <button id="deploy-button" class="vercel-deployments-list__button <?php echo ($in_deployment ? "button vercel-deployments-list__button--inactive" : "button-primary"); ?>">Deploy 🚀</a>
        </div>
        <?php
    }
}

add_action('wp_dashboard_setup', 'create_dashboard_widget');

// Enqueue JavaScript and localize data
function custom_enqueue_scripts() {
    wp_enqueue_script('custom-script', plugin_dir_url(__FILE__) . 'index.js', array('jquery'), '1.0', true);

    wp_localize_script('custom-script', 'deployButton', array(
        'ajax_url' => admin_url('admin-ajax.php'),
        'nonce'    => wp_create_nonce('deploy-button-nonce'),
    ));
}
add_action('admin_enqueue_scripts', 'custom_enqueue_scripts');

function custom_ajax_callback() {
    if (isset($_POST['nonce']) && wp_verify_nonce($_POST['nonce'], 'deploy-button-nonce')) {
        deploy();
    }

    wp_die();
}
add_action('wp_ajax_deploy_button_action', 'custom_ajax_callback');


function deploy() {
    new_deploy();
}

// function recursiveCall() {
//     // Your recursive function logic here

//     // For this example, we'll just print a message
//     echo "Recursive call at: " . date('Y-m-d H:i:s') . "\n";

//     // Wait for one second before making the next recursive call
//     sleep(1);

//     // Make the recursive call to the function itself
//     recursiveCall();
// }

// // Start the recursive function
// recursiveCall();