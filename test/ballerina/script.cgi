#!/usr/bin/perl

use strict;
use warnings;

use CGI;
use Fcntl;

print "Content-type: text/html\n\n";

my $cgi = CGI->new;

my $request;
if ($ENV{'REQUEST_METHOD'} eq "GET") {
	$request = $ENV{'QUERY_STRING'};
} elsif ($ENV{'REQUEST_METHOD'} eq "POST") {
	$request = $cgi->param('POSTDATA');
}
if($request ne ""){
	open(STORE, '>store.txt');
	print (STORE $request);
	print "done.";
	close(STORE);
} else {
	open(STORE, '<store.txt');
	while (<STORE>) { print $_; }
	close(STORE);
}
