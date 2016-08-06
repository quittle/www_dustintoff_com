#!/usr/bin/perl
THIS LINE BREAKS ME SAFELY THIS LINE BREAKS ME SAFELY THIS LINE BREAKS ME SAFELY
use strict;
use warnings;
use CGI;
use File::Path;
use File::Copy;
use File::Copy::Recursive qw(fcopy rcopy dircopy fmove dirmove rmove);
use Digest::MD5 qw(md5 md5_hex md5_base64);
#use File::Remove 'remove';
use Fcntl;
$File::Copy::Recursive::CPRFComp = 1;

########## USER VARIABLES ##########
my $secretWindow = 1; #In minutes
####################################

my $cgi = CGI->new;

print "Content-type: text/html\n\n";

my $request = "default";
if ($ENV{'REQUEST_METHOD'} eq "GET") {
	$request = $ENV{'QUERY_STRING'};
} elsif ($ENV{'REQUEST_METHOD'} eq "POST") {
	$request = $cgi->param('POSTDATA');
}

my @args = split(/\|/, $request);

my $username = $args[0];
my $secret = $args[1];
shift(@args);
shift(@args);

my $action = $args[0];
my $loc = $args[1];
my $find = quotemeta('%20');
$action =~ s/$find/ /g;
$loc =~ s/$find/ /g;

if($action ne "Login" && $action ne "Validate"){
	my $password = getPassword($username);
	my $age = -A "val.txt";
	open(LOGIN_VALIDATE, '<val.txt');
	if($secret ne md5_hex($password . <LOGIN_VALIDATE>) || $age gt ($secretWindow/1440)){
		unlink("val.txt");
		print "VALIDATION_ERROR(-1)";
		close(LOGIN_VALIDATE);
		exit();
	} elsif ($action eq "Validate"){
		print "0";
	}
	close(LOGIN_VALIDATE);
}


if($action eq "getFiles"){
	my @files = getFilesInDirectory($loc);
	my $output = "";
	foreach my $file (@files){
		$output = $output . $file . "|";
	}
	$output = substr($output, 0, length($output)-1);
	print $output;
} elsif($action eq "getDirs"){
	my @dirs = getDirectoriesInDirectory($loc);
	my $output = "";
	foreach my $dir (@dirs){
		$output = $output . $dir . "|";
	}
	$output = substr($output, 0, length($output)-1);
	print $output;
} elsif($action eq "Delete"){
	my @locs = split(/\:/, $loc);
	foreach my $file (@locs){
		rmtree($file);
	}
	print "Successfully deleted.";
} elsif($action eq "Create Directory"){
	if(mkpath($loc)){
		print "'" . $loc . "' successfully created.";
	} else {
		print "Directory could not be created.";
	}
} elsif($action eq "Create File"){
	if(sysopen(FILE, $loc, O_RDWR| O_EXCL| O_CREAT, 0755)){
		print "'" . $loc . "' successfully created.";
	} else {
		print "File could not be created.";
	}
	close(FILE);
} elsif($action eq "Move"){
	my $pasteLoc = $args[2];
	my @locs = split(/\:/, $loc);
	my $num = 0;
	foreach my $file (@locs){
		$num += rmove($file, $pasteLoc);
	}
	print "Successfully cut/pasted " . $num . " items.";
} elsif($action eq "Paste"){
	my $pasteLoc = $args[2];
	my @locs = split(/\:/, $loc);
	my $num = 0;
	foreach my $file (@locs){
		$num += rcopy($file, $pasteLoc);
	}
	print "Successfully copied " . $num . " items.";
} elsif($action eq "Rename"){
	my $newName = substr($loc, 0, rindex($loc, "/")+1) . $args[2];
	if(rename($loc, $newName)){
		print "0";
	} else {
		print "-1";
	}
} elsif($action eq "Properties"){
	print "File: '" . $loc . "' properties:";
} elsif($action eq "shell"){
	my $i = 3;
	while($args[$i]){
		$args[2] = $args[2] . "|" . $args[$i++];
	}
	chdir($loc) or print "-1";
	print `$args[2]`;
} elsif($action eq "Login"){
	if(getPassword($loc) ne 0){
		my $num = rand();
		open(LOGIN_VALIDATE, '>val.txt');
		print (LOGIN_VALIDATE $num);
		close(LOGIN_VALIDATE);
		print $num;
	} else {
		print "-1";
	}
} elsif($action eq "createUser"){
	my $pass = $args[2];
	if(!getPassword($loc)){
		open(USERNAME, '>>usernames');
		print USERNAME $loc . "\n";
		close(USERNAME);
		open(PASSWORD, '>>passwords');
		print PASSWORD $pass . "\n";
		close(PASSWORD);
		print "User created";
	} else{
		print "Username already exists";
	}
}

#Returns array containing all directories in directory
sub getDirectoriesInDirectory {
	my @dirs;
	my $dir = $_[0] || "./";
	opendir(DIR, $dir) || die $!;
	while(my $file = readdir(DIR)){
		if((-d "$dir/$file") && $file ne "." && $file ne ".."){
			push(@dirs, $file);
		}
	}
	closedir(DIR);
	@dirs = sort(@dirs);
	return @dirs;
}

#Returns array containing all files in directory
sub getFilesInDirectory {
	my @files;
	my $dir = $_[0] || "./";
	opendir(DIR, $dir);
	while(my $file = readdir(DIR)){
		if(-f "$dir/$file"){
			push(@files, $file);
		}
	}
	closedir(DIR);
	@files = sort(@files);
	return @files;
}

#Reads a file in string
sub read_file {
	my $src_code;
	open(FILE,"<$_[0]");
	while(<FILE>){
		$src_code .= $_;
	}
	close(FILE);
	return $src_code;
}

#Gets the password hash for a given username
sub getPassword {
	my $username = $_[0];
	open(USERNAMES, "<usernames");
	my $i = 0;
	my $found = 0;
	while(<USERNAMES>){
		chomp;
		if($_ eq $username){
			$found = 1;
			last;
		}
		$i++;
	}
	close(USERNAMES);
	if($found){
		open(PASSWORDS, "<passwords");
		while(<PASSWORDS>){
			chomp;
			if($i eq 0){
				close(PASSWORDS);
				return $_;
			}
			$i--;
		}
	} else {
		return 0;
	}
	
}