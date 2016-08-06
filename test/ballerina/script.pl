#!/usr/bin/perl

use strict;
use warnings;

use CGI;
use Fcntl;

my $cgi = CGI->new;

print "Content-type: text/html\n\n";

my $request = "default";
if ($ENV{'REQUEST_METHOD'} eq "GET") {
	$request = $ENV{'QUERY_STRING'};
}

open(STORE, '>store.txt');
print (STORE $request);
close(STORE);

print "done.";