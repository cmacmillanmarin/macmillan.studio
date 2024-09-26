<?php

function get_deployments() {
    global $ms_vercel_base_url, $ms_vercel_api_token, $ms_vercel_team_id, $ms_vercel_project_id;
    $opts = [
        'http' => [
            'method' => 'GET',
            'header' => "Authorization: Bearer $ms_vercel_api_token\r\n"
        ]
    ];
    $context = stream_context_create($opts);
    $api_call = $ms_vercel_base_url.'/v6/deployments?projectId='.$ms_vercel_project_id.'&teamId='.$ms_vercel_team_id.'&target=production&limit=4';
    $response = file_get_contents($api_call, false, $context);
    return $response;
}

function new_deploy() {
    global $ms_vercel_deploy_hook;
    $opts = [
        'http' => [
            'method' => 'GET'
        ]
    ];
    $context = stream_context_create($opts);
    $response = file_get_contents($ms_vercel_deploy_hook, false, $context);
    return $response;
}